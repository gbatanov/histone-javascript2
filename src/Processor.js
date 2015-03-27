var RTTI = require('./RTTI'),
	Utils = require('./Utils'),
	HistoneArray = require('./Array'),
	HistoneMacro = require('./Macro'),
	Constants = require('./Constants'),
	Parser = require('./parser/Parser');

var Utils_forEachAsync = Utils.forEachAsync;
var RTTI_global = RTTI.getGlobal();
var RTTI_toString = RTTI.toString;
var RTTI_toBoolean = RTTI.toBoolean;
var RTTI_toHistone = RTTI.toHistone;
var RTTI_callAsync = RTTI.callAsync;
var isNumeric = Utils.isNumeric;

function processArray(node, scope, ret) {
	var result = new HistoneArray();
	Utils_forEachAsync(node, function(node, next) {
		processNode(node[1], scope, function(value) {
			result.push(value, node[2]);
			next();
		});
	}, function() { ret(result); }, 1);
}

function processRegExp(node, scope, ret) {
	var flagsNum = node[2], flagsStr = '';
	if (flagsNum & Constants.RE_GLOBAL) flagsStr += 'g';
	if (flagsNum & Constants.RE_MULTILINE) flagsStr += 'm';
	if (flagsNum & Constants.RE_IGNORECASE) flagsStr += 'i';
	ret(new RegExp(node[1], flagsStr));
}

function processNot(node, scope, ret) {
	processNode(node[1], scope, function(value) {
		ret(!RTTI_toBoolean(value));
	});
}

function processOr(node, scope, ret) {
	processNode(node[1], scope, function(value) {
		if (RTTI_toBoolean(value)) ret(value);
		else processNode(node[2], scope, ret);
	});
}

function processAnd(node, scope, ret) {
	processNode(node[1], scope, function(value) {
		if (!RTTI_toBoolean(value)) ret(value);
		else processNode(node[2], scope, ret);
	});
}

function processTernary(node, scope, ret) {
	processNode(node[1], scope, function(condition) {
		if (RTTI_toBoolean(condition))
			processNode(node[2], scope, ret);
		else if (node.length > 3)
			processNode(node[3], scope, ret);
		else ret();
	});
}

function processEquality(node, scope, ret) {
	processNode(node[1], scope, function(left) {
		processNode(node[2], scope, function(right) {

			if (typeof left === 'string' && typeof right === 'number') {
				if (isNumeric(left)) left = parseFloat(left);
				else right = RTTI_toString(right);
			}

			else if (typeof left === 'number' && typeof right === 'string') {
				if (isNumeric(right)) right = parseFloat(right);
				else left = RTTI_toString(left);
			}

			if (!(typeof left === 'string' && typeof right === 'string')) {
				if (typeof left === 'number' && typeof right === 'number') {
					left = parseFloat(left);
					right = parseFloat(right);
				} else {
					left = RTTI_toBoolean(left);
					right = RTTI_toBoolean(right);
				}
			}

			var result = (left === right);
			ret(node[0] === Constants.AST_EQ ? result : !result);

		});
	});
}

function processRelational(node, scope, ret) {
	processNode(node[1], scope, function(left) {
		processNode(node[2], scope, function(right) {


			if (typeof left === 'string' && typeof right === 'number') {
				if (isNumeric(left)) left = parseFloat(left);
				else right = RTTI_toString(right);
			}

			else if (typeof left === 'number' && typeof right === 'string') {
				if (isNumeric(right)) right = parseFloat(right);
				else left = RTTI_toString(left);
			}

			if (!(typeof left === 'number' && typeof right === 'number')) {
				if (typeof left === 'string' && typeof right === 'string') {
					left = left.length;
					right = right.length;
				} else {
					left = RTTI_toBoolean(left);
					right = RTTI_toBoolean(right);
				}
			}

			switch (node[0]) {
				case Constants.AST_LT: return ret(left < right);
				case Constants.AST_GT: return ret(left > right);
				case Constants.AST_LE: return ret(left <= right);
				case Constants.AST_GE: return ret(left >= right);
			}

		});
	});
}

function processUnaryMinus(node, scope, ret) {
	processNode(node[1], scope, function(value) {
		value = Utils.toNumber(value);
		if (typeof value === 'number')
			ret(-value);
		else ret();
	});
}

function processAddition(node, scope, ret) {
	processNode(node[1], scope, function(left) {
		processNode(node[2], scope, function(right) {

			if (!(typeof left === 'string' || typeof right === 'string')) {

				if (isNumeric(left) || isNumeric(right)) {
					if (isNumeric(left)) left = parseFloat(left);
					if (typeof left !== 'number') return ret();
					if (isNumeric(right)) right = parseFloat(right);
					if (typeof right !== 'number') return ret();
					return ret(left + right);
				}

				if (left instanceof HistoneArray &&
					right instanceof HistoneArray) {
					return ret(left.concat(right));
				}
			}

			return ret(RTTI_toString(left) + RTTI_toString(right));
		});
	});
}

function processArithmetical(node, scope, ret) {
	processNode(node[1], scope, function(left) {
		processNode(node[2], scope, function(right) {

			if (isNumeric(left)) left = parseFloat(left);
			if (typeof left !== 'number') return ret();

			if (isNumeric(right)) right = parseFloat(right);
			if (typeof right !== 'number') return ret();

			switch (node[0]) {
				case Constants.AST_SUB: return ret(left - right);
				case Constants.AST_MUL: return ret(left * right);
				case Constants.AST_DIV: return ret(left / right);
				case Constants.AST_MOD: return ret(left % right);
			}

		});
	});
}

function processMethod(node, scope, retn, args) {
	if (!(args instanceof Array)) args = [];
	processNode(node[1], scope, function(subject) {
		RTTI_callAsync(subject, node[2], args, scope, retn);
	});
}

function processProperty(node, scope, retn) {
	processNode(node[1], scope, function(left) {
		processNode(node[2], scope, function(right) {
			RTTI_callAsync(left, RTTI.GET, [right], scope, retn);
		});
	});
}

function processCall(node, scope, retn) {
	var args = [];
	Utils_forEachAsync(node, function(arg, next) {
		processNode(arg, scope, function(arg) {
			args.push(arg);
			next();
		});
	}, function() {
		var callee = node[1];
		if (callee instanceof Array && callee[0] === Constants.AST_METHOD) {
			processMethod(callee, scope, retn, args);
		} else processNode(callee, scope, function(callee) {
			RTTI_callAsync(callee, RTTI.CALL, args, scope, retn);
		});
	}, 2);
}

function processIf(node, scope, retn, retf) {
	var result = '';
	Utils_forEachAsync(node, function(statement, next, index) {
		if (node.length > ++index) {
			processNode(node[index], scope, function(value) {
				if (!RTTI_toBoolean(value)) return next();
				processNode(statement, scope, function(value) {
					result = value;
					next(true);
				}, retf);
			});
		} else processNode(statement, scope, function(value) {
			result = value;
			next(true);
		}, retf);
	}, function() { retn(result); }, 1, 2);
}

function processFor(node, scope, retn, retf) {
	processNode(node[4], scope, function(collection) {
		var result = '', keyIndex = node[1], valIndex  = node[2];

		if (collection instanceof HistoneArray && collection.getLength()) {
			collection.forEachAsync(function(value, next, key, index, last) {
				var iterationScope = scope.extend();

				iterationScope.putVar({
					key: key,
					value: value,
					index: index,
					last: last
				}, 0);

				if (keyIndex) iterationScope.putVar(key, keyIndex, true);
				if (valIndex) iterationScope.putVar(value, valIndex, true);

				processNode(node[3], iterationScope, function(iteration) {
					result += iteration;
					next();
				}, retf);

			}, function() { retn(result); });
		}

		else Utils_forEachAsync(node, function(statement, next, index) {
			if (node.length > ++index) {
				processNode(node[index], scope, function(value) {
					if (!RTTI_toBoolean(value)) return next();
					processNode(statement, scope, function(value) {
						result = value;
						next(true);
					}, retf);
				});
			} else processNode(statement, scope, function(value) {
				result = value;
				next(true);
			}, retf);
		}, function() { retn(result); }, 5, 2);



	});
}

function processVar(node, scope, retn) {
	processNode(node[1], scope, function(value) {
		scope.putVar(value, node[2], true);
		retn('');
	});
}

function processMacro(node, scope, ret) {
	var params = (node.length > 3 ? new Array(node[3]) : []);
	Utils_forEachAsync(node, function(paramIndex, next, index) {
		processNode(node[index + 1], scope, function(paramValue) {
			params[paramIndex] = paramValue;
			next();
		});
	}, function() {
		scope.putVar(new HistoneMacro(params, node[2], scope), node[1], true);
		ret('');
	}, 4, 2);
}

function processNodeList(node, scope, retn, retf) {
	var result = '';
	Utils_forEachAsync(node, function(node, next) {
		processNode(node, scope, function(node) {
			result += RTTI_toString(node);
			next();
		}, retf);
	}, function() { retn(result); }, 1);
}

function processNode(node, scope, retn, retf) {

	retf = (retf || retn);

	if (node instanceof Array) switch (node[0]) {

		case Constants.AST_ARRAY: processArray(node, scope, retn); break;
		case Constants.AST_REGEXP: processRegExp(node, scope, retn); break;

		case Constants.AST_NOT: processNot(node, scope, retn); break;
		case Constants.AST_OR: processOr(node, scope, retn); break;
		case Constants.AST_AND: processAnd(node, scope, retn); break;
		case Constants.AST_TERNARY: processTernary(node, scope, retn); break;

		case Constants.AST_EQ:
		case Constants.AST_NEQ:
			processEquality(node, scope, retn); break;

		case Constants.AST_ADD:
			processAddition(node, scope, retn); break;

		case Constants.AST_SUB:
		case Constants.AST_MUL:
		case Constants.AST_DIV:
		case Constants.AST_MOD:
			processArithmetical(node, scope, retn); break;

		case Constants.AST_LT:
		case Constants.AST_GT:
		case Constants.AST_LE:
		case Constants.AST_GE:
			processRelational(node, scope, retn); break;

		case Constants.AST_USUB:
			processUnaryMinus(node, scope, retn); break;

		// built - in references
		case Constants.AST_THIS: retn(scope.getThis()); break;
		case Constants.AST_GLOBAL: retn(RTTI_global); break;

		// accessors
		case Constants.AST_REF: retn(scope.getVar(node[1], node[2])); break;
		case Constants.AST_METHOD: processMethod(node, scope, retn); break;
		case Constants.AST_PROP: processProperty(node, scope, retn); break;
		case Constants.AST_CALL: processCall(node, scope, retn); break;

		// statements
		case Constants.AST_IF: processIf(node, scope, retn, retf); break;
		case Constants.AST_FOR: processFor(node, scope, retn, retf); break;
		case Constants.AST_VAR: processVar(node, scope, retn); break;
		case Constants.AST_MACRO: processMacro(node, scope, retn); break;
		case Constants.AST_RETURN: processNode(node[1], scope, retf); break;

		// node lists
		case Constants.AST_NODELIST: processNodeList(node, scope, retn, retf); break;
		case Constants.AST_NODES: processNodeList(node, scope.extend(), retn, retf); break;

		default: console.info(node); throw 'x';

	} else retn(node);
}


function Processor(baseURI, thisObj) {
	this.variables = [];
	this.parents = [];
	this.baseURI = baseURI;
	this.thisObj = RTTI_toHistone(thisObj);
}

Processor.prototype.getBaseURI = function() {
	return this.baseURI;
};

Processor.prototype.getThis = function() {
	return this.thisObj;
};

Processor.prototype.putVar = function(value, index, raw) {
	if (!raw) value = RTTI_toHistone(value);
	this.variables[index] = value;
};

Processor.prototype.getVar = function(level, index) {
	if (!level) return this.variables[index];
	return this.parents[level - 1].variables[index];
};

Processor.prototype.extend = function() {
	var scope = new Processor(this.baseURI, this.thisObj);
	scope.parents = [this].concat(this.parents);
	return scope;
};

Processor.prototype.process = function(node, ret) {
	processNode(node, this, ret);
};

module.exports = Processor;