var Scope = require('./Scope.js');
var Constants = require('./Constants.js');
var HistoneMacro = require('./Macro.js');
var HistoneArray = require('./Array.js');
var Runtime = require('./Runtime.js');

function HistoneGlobal() {};
var globalObject = new HistoneGlobal;

function isNumeric(value) {
	return (!isNaN(parseFloat(value)) && isFinite(value));
}

function forEachAsync(list, iterator, ret, start, step) {
	if (!(list instanceof Object)) return ret();
	if (!start) start = 0;

	if (!step) step = 1;

	var keys, key, length;
	var i = -step + start, calls = 0, looping = false;
	if (list instanceof Array) {
		length = list.length;
	} else {
		keys = Object.keys(list);
		length = keys.length;
	}

	var resume = function() {
		calls += 1;
		if (looping) return;
		looping = true;

		while (calls > 0) {
			calls -= 1, i += step;
			if (i >= length) return ret();
			key = (keys ? keys[i] : i);
			iterator(list[key], function(stop) {
				if (stop === true) ret();
				else resume();
			}, key);
		}

		looping = false;
	};

	resume();
}




function processArray(node, scope, ret) {
	var result = new HistoneArray();
	forEachAsync(node, function(node, next) {
		processNode(node[1], scope, function(value) {
			result.set(value, node[2]);
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
		ret(!Runtime.toBoolean(value));
	});
}

function processOr(node, scope, ret) {
	processNode(node[1], scope, function(value) {
		if (Runtime.toBoolean(value)) ret(value);
		else processNode(node[2], scope, ret);
	});
}

function processAnd(node, scope, ret) {
	processNode(node[1], scope, function(value) {
		if (!Runtime.toBoolean(value)) ret(value);
		else processNode(node[2], scope, ret);
	});
}

function processTernary(node, scope, ret) {
	processNode(node[1], scope, function(condition) {
		if (Runtime.toBoolean(condition))
			processNode(node[2], scope, ret);
		else if (node.length > 3)
			processNode(node[3], scope, ret);
		else ret();
	});
}

function processAddition(node, scope, ret) {
	processNode(node[1], scope, function(left) {
		processNode(node[2], scope, function(right) {
			if (!(typeof left === 'string' && typeof right === 'string')) {
				if (typeof left === 'number' || typeof right === 'number') {
					if (isNumeric(left)) left = parseFloat(left);
					if (typeof left !== 'number') return ret();
					if (isNumeric(right)) right = parseFloat(right);
					if (typeof right !== 'number') return ret();
					return ret(left + right);
				} else if (left instanceof HistoneArray &&
					right instanceof HistoneArray) {
					var result = left.clone();
					result = result.concat(right);
					return ret(result);
				}
			}
			ret(Runtime.toString(left) + Runtime.toString(right));
		});
	});
}

function processArithmetical(node, scope, ret) {
	processNode(node[1], scope, function(left) {
		if (isNumeric(left)) left = parseFloat(left);
		if (typeof left !== 'number') return ret();
		if (node[0] === Constants.AST_USUB) return ret(-left);
		processNode(node[2], scope, function(right) {
			if (isNumeric(right)) right = parseFloat(right);
			if (typeof right !== 'number') return ret();
			switch (node[0]) {
				case Constants.AST_SUB: ret(left - right); break;
				case Constants.AST_MUL: ret(left * right); break;
				case Constants.AST_DIV: ret(left / right); break;
				case Constants.AST_MOD: ret(left % right); break;
			}
		});
	});
}

function processRelational(node, scope, ret) {
	processNode(node[1], scope, function(left) {
		processNode(node[2], scope, function(right) {
			if (typeof left === 'string' && typeof right === 'number') {
				if (isNumeric(left)) left = parseFloat(left);
				else right = Runtime.toString(right);
			} else if (typeof left === 'number' && typeof right === 'string') {
				if (isNumeric(right)) right = parseFloat(right);
				else left = Runtime.toString(left);
			}
			if (!(typeof left === 'number' && typeof right === 'number')) {
				if (typeof left === 'string' && typeof right === 'string') {
					left = left.length;
					right = right.length;
				} else {
					left = Runtime.toBoolean(left);
					right = Runtime.toBoolean(right);
				}
			}
			switch (node[0]) {
				case Constants.AST_LT: ret(left < right); break;
				case Constants.AST_GT: ret(left > right); break;
				case Constants.AST_LE: ret(left <= right); break;
				case Constants.AST_GE: ret(left >= right); break;
			}
		});
	});
}

function processEquality(node, scope, ret) {
	processNode(node[1], scope, function(left) {
		processNode(node[2], scope, function(right) {
			if (typeof left === 'string' && typeof right === 'number') {
				if (!isNumeric(left)) left = parseFloat(left);
				else right = Runtime.toString(right);
			} else if (typeof left === 'number' && typeof right === 'string') {
				if (!isNumeric(right)) right = parseFloat(right);
				else left = Runtime.toString(left);
			}
			if (!(typeof left === 'string' && typeof right === 'string')) {
				if (typeof left === 'number' && typeof right === 'number') {
					left = parseFloat(left);
					right = parseFloat(right);
				} else {
					left = Runtime.toBoolean(left);
					right = Runtime.toBoolean(right);
				}
			}
			var result = (left === right);
			ret(node[0] === Constants.AST_EQ ? result : !result);
		});
	});
}

function processIf(node, scope, retn, retf) {
	var result = '';
	forEachAsync(node, function(statement, next, index) {
		if (node.length > ++index) {
			processNode(node[index], scope, function(value) {
				if (!Runtime.toBoolean(value)) return next();
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

function processVar(node, scope, retn) {
	processNode(node[1], scope, function(value) {
		scope.putVar(value, node[2]);
		retn('');
	});
}

function processFor(node, scope, retn, retf) {
	throw 'processFor';
}

function processMacro(node, scope, ret) {
	var params = (node.length > 3 ? new Array(node[3]) : []);
	forEachAsync(node, function(paramIndex, next, index) {
		processNode(node[index + 1], scope, function(paramValue) {
			params[paramIndex] = paramValue;
			next();
		});
	}, function() {
		scope.putVar(new HistoneMacro(params, node[2], scope), node[1]);
		ret('');
	}, 4, 2);
}







function processProperty(node, scope, retn) {
	processNode(node[1], scope, function(left) {
		processNode(node[2], scope, function(right) {
			Runtime.call(left, '__get', [right], scope, retn);
		});
	});
}

function processMethod(node, scope, retn, args) {
	if (!(args instanceof Array)) args = [];
	processNode(node[1], scope, function(subject) {
		Runtime.call(subject, node[2], args, scope, retn);
	});
}

function processCall(node, scope, retn) {
	var args = [];
	forEachAsync(node, function(arg, next) {
		processNode(arg, scope, function(arg) {
			args.push(arg), next();
		});
	}, function() {
		var callee = node[1];
		if (callee instanceof Array &&
			callee[0] === Constants.AST_METHOD) {
			processMethod(callee, scope, retn, args);
		} else processNode(callee, scope, function(callee) {
			Runtime.call(callee, '__call', args, scope, retn);
		});
	}, 2);
}

function processNodeList(node, scope, retn, retf) {
	var result = '';
	forEachAsync(node, function(node, next) {
		processNode(node, scope, function(node) {
			result += Runtime.toString(node);
			next();
		}, retf);
	}, function() { retn(result); }, 1);
}

function processNode(node, scope, retn, retf) {

	retf = (retf || retn);

	if (node instanceof Array) switch (node[0]) {

		// primitives
		case Constants.AST_ARRAY: processArray(node, scope, retn); break;
		case Constants.AST_REGEXP: processRegExp(node, scope, retn); break;

		// logical
		case Constants.AST_NOT: processNot(node, scope, retn); break;
		case Constants.AST_OR: processOr(node, scope, retn); break;
		case Constants.AST_AND: processAnd(node, scope, retn); break;
		case Constants.AST_TERNARY: processTernary(node, scope, retn); break;

		// addition
		case Constants.AST_ADD: processAddition(node, scope, retn); break;

		// arithmetical
		case Constants.AST_SUB:
		case Constants.AST_MUL:
		case Constants.AST_DIV:
		case Constants.AST_MOD:
		case Constants.AST_USUB:
			processArithmetical(node, scope, retn); break;

		// relational
		case Constants.AST_LT:
		case Constants.AST_GT:
		case Constants.AST_LE:
		case Constants.AST_GE:
			processRelational(node, scope, retn); break;

		// equality
		case Constants.AST_EQ:
		case Constants.AST_NEQ:
			processEquality(node, scope, retn); break;

		// statements
		case Constants.AST_IF: processIf(node, scope, retn, retf); break;
		case Constants.AST_VAR: processVar(node, scope, retn); break;
		case Constants.AST_FOR: processFor(node, scope, retn, retf); break;
		case Constants.AST_MACRO: processMacro(node, scope, retn); break;
		case Constants.AST_RETURN: processNode(node[1], scope, retf); break;



		// expressions
		case Constants.AST_REF: retn(scope.getVar(node[1], node[2])); break;
		case Constants.AST_PROP: processProperty(node, scope, retn); break;
		case Constants.AST_CALL: processCall(node, scope, retn); break;
		case Constants.AST_METHOD: processMethod(node, scope, retn); break;



		case Constants.AST_NODES: processNodeList(node, scope.extend(), retn, retf); break;
		case Constants.AST_NODELIST: processNodeList(node, scope, retn, retf); break;

		// built-in
		case Constants.AST_THIS: retn(scope.getThis()); break;
		case Constants.AST_GLOBAL: retn(globalObject); break;


		default: console.info(node); throw 'x';

	} else retn(node);
}

module.exports = function(node, scope, ret) {
	processNode(node, scope, ret);
};