var Scope = require('./Scope.js');
var Constants = require('./Constants.js');
var HistoneMacro = require('./Macro.js');
var HistoneArray = require('./Array.js');
var Runtime = require('./Runtime.js');

function HistoneGlobal() {};
var globalObject = new HistoneGlobal;

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


function array_key_exists(key, array) {
	return (typeof array[key] !== 'undefined');
}

function processArray(node, scope, retn) {
	var result = new HistoneArray();
	forEachAsync(node, function(node, next) {
		processNode(node[1], scope, function(value) {
			result.set(value, node[2]);
			next();
		});
	}, function() { retn(result); }, 1);
}

function processRegExp(node, scope, retn) {
	var flagsNum = node[2], flagsStr = '';
	if (flagsNum & Constants.RE_GLOBAL) flagsStr += 'g';
	if (flagsNum & Constants.RE_MULTILINE) flagsStr += 'm';
	if (flagsNum & Constants.RE_IGNORECASE) flagsStr += 'i';
	retn(new RegExp(node[1], flagsStr));
}

function processMacro(node, scope, retn) {
	var params = (array_key_exists(3, node) ? new Array(node[3]) : []);
	forEachAsync(node, function(paramIndex, next, index) {
		processNode(node[index + 1], scope, function(paramValue) {
			params[paramIndex] = paramValue, next();
		});
	}, function() {
		scope.putVar(new HistoneMacro(params, node[2], scope), node[1]);
		retn('');
	}, 4, 2);
}

function processNot(node, scope, retn) {
	processNode(node[1], scope, function(value) {
		retn(!Runtime.toBoolean(value));
	});
}

function processOr(node, scope, retn) {
	processNode(node[1], scope, function(value) {
		if (Runtime.toBoolean(value)) retn(value);
		else processNode(node[2], scope, retn);
	});
}

function processAnd(node, scope, retn) {
	processNode(node[1], scope, function(value) {
		if (!Runtime.toBoolean(value)) retn(value);
		else processNode(node[2], scope, retn);
	});
}

function processTernary(node, scope, retn) {
	processNode(node[1], scope, function(condition) {
		if (Runtime.toBoolean(condition))
			processNode(node[2], scope, retn);
		else if (array_key_exists(3, node))
			processNode(node[3], scope, retn);
		else retn();
	});
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

function processIf(node, scope, retn, retf) {
	var result = '';
	forEachAsync(node, function(statement, next, index) {
		if (array_key_exists(index + 1, node)) {
			processNode(node[index + 1], scope, function(value) {
				if (!Runtime.toBoolean(value)) return next();
				processNode(statement, scope, function(value) {
					result = value, next(true);
				}, retf);
			});
		} else processNode(statement, scope, function(value) {
			result = value, next(true);
		}, retf);
	}, function() { retn(result); }, 1, 2);
}

function processVar(node, scope, retn) {
	processNode(node[1], scope, function(value) {
		scope.putVar(value, node[2]);
		retn('');
	});
}

function processNodes(node, scope, retn, retf) {
	var result = '';
	scope = scope.extend();
	forEachAsync(node, function(node, next) {
		processNode(node, scope, function(node) {
			result += Runtime.toString(node);
			next();
		}, retf);
	}, function() { retn(result); }, 1);
}

function processNode(node, scope, retn, retf) {

	retf = (retf || retn);
	// if (typeof push !== 'boolean') push = true;

	if (node instanceof Array) switch (node[0]) {

		case Constants.AST_GLOBAL: retn(globalObject); break;
		case Constants.AST_ARRAY: processArray(node, scope, retn); break;
		case Constants.AST_REGEXP: processRegExp(node, scope, retn); break;
		case Constants.AST_MACRO: processMacro(node, scope, retn); break;

		case Constants.AST_NOT: processNot(node, scope, retn); break;
		case Constants.AST_OR: processOr(node, scope, retn); break;
		case Constants.AST_AND: processAnd(node, scope, retn); break;
		case Constants.AST_TERNARY: processTernary(node, scope, retn); break;

		case Constants.AST_PROP: processProperty(node, scope, retn); break;
		case Constants.AST_METHOD: processMethod(node, scope, retn); break;
		case Constants.AST_CALL: processCall(node, scope, retn); break;

		case Constants.AST_IF: processIf(node, scope, retn, retf); break;
		case Constants.AST_VAR: processVar(node, scope, retn); break;
		case Constants.AST_REF: retn(scope.getVar(node[1], node[2])); break;
		case Constants.AST_NODES: processNodes(node, scope, retn, retf); break;
		case Constants.AST_RETURN: processNode(node[1], scope, retf); break;

		default: console.info(node); throw 'x';

	} else retn(node);
}

module.exports = function(node, scope, ret) {
	processNode(node, scope, ret);
};