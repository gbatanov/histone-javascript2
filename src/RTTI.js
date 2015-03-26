var Utils = require('./Utils.js');
var Constants = require('./Constants.js');
var HistoneMacro = require('./Macro.js');
var HistoneArray = require('./Array.js');
var isNumeric = Utils.isNumeric;
var forEachAsync = Utils.forEachAsync;

var RESOURCE_LOADER = null;

function HistoneGlobal() {}
var globalObject = new HistoneGlobal();


var REGISTERED_TYPES = {

	'base': {},
	'undefined': {},
	'null': {},
	'boolean': {},
	'number': {},
	'string': {},
	'RegExp': {},
	'HistoneMacro': {},
	'HistoneArray': {},
	'HistoneGlobal': {}

};


function getType(value) {
	var type = (typeof value);
	if (type === 'number') {
		if (isNaN(value) || !isFinite(value))
			type = 'undefined';
	} else if (type === 'object') {
		if (value === null) type = 'null';
		else type = value.constructor.name;
	}
	return type;
}

function getMember(value, member) {

	var members, member,
		type = getType(value);

	if (REGISTERED_TYPES.hasOwnProperty(type))
		members = REGISTERED_TYPES[type];
	else members = REGISTERED_TYPES['base'];


	if (!members.hasOwnProperty(member)) {
		members = REGISTERED_TYPES['base'];
		if (members.hasOwnProperty(member)) {
			return members[member];
		}
	} else return members[member];


}


function callSync(value, method, args, scope) {
	var result = getMember(value, method);
	if (typeof result === 'function') {
		return result(value, args, scope);
	} else return result;
}

function callAsync(value, method, args, scope, ret) {
	var result = getMember(value, method);

	if (typeof result === 'function') {

		// console.info(method, result.length);

		if (result.length < 4) {

			result = result(value, args, scope);
			result = toHistone(result);
			ret(result);

		} else result(value, args, scope, function(result) {
			result = toHistone(result);
			ret(result);
		});

	} else ret(result);

}



function toString(value) {
	return callSync(value, 'toString');
}

function toBoolean(value) {
	return callSync(value, 'toBoolean');
}

function toJSON(value) {
	return callSync(value, 'toJSON');
}




function getGlobal() {
	return globalObject;
}

function newArray(items) {
	var array = new HistoneArray();
	for (var c = 0; c < items.length; c++)
		array.push(items[c][0], items[c][1]);
	return array;
}

function newMacro(params, body, scope) {
	return new HistoneMacro(params, body, scope);
}


function processEquality(left, right) {

	if (typeof left === 'string' && typeof right === 'number') {
		if (isNumeric(left)) left = parseFloat(left);
		else right = toString(right);
	}

	else if (typeof left === 'number' && typeof right === 'string') {
		if (isNumeric(right)) right = parseFloat(right);
		else left = toString(left);
	}

	if (!(typeof left === 'string' && typeof right === 'string')) {
		if (typeof left === 'number' && typeof right === 'number') {
			left = parseFloat(left);
			right = parseFloat(right);
		} else {
			left = toBoolean(left);
			right = toBoolean(right);
		}
	}

	return (left === right);

}

function processRelational(type, left, right) {

	if (typeof left === 'string' && typeof right === 'number') {
		if (isNumeric(left)) left = parseFloat(left);
		else right = toString(right);
	}

	else if (typeof left === 'number' && typeof right === 'string') {
		if (isNumeric(right)) right = parseFloat(right);
		else left = toString(left);
	}

	if (!(typeof left === 'number' && typeof right === 'number')) {
		if (typeof left === 'string' && typeof right === 'string') {
			left = left.length;
			right = right.length;
		} else {
			left = toBoolean(left);
			right = toBoolean(right);
		}
	}

	switch (type) {
		case Constants.AST_LT: return (left < right);
		case Constants.AST_GT: return (left > right);
		case Constants.AST_LE: return (left <= right);
		case Constants.AST_GE: return (left >= right);
	}

}

function processUnaryMinus(value) {
	value = Utils.toNumber(value);
	if (typeof value === 'number') return (-value);
}



function processArithmetical(type, left, right) {

	if (isNumeric(left)) left = parseFloat(left);
	if (typeof left !== 'number') return;

	if (isNumeric(right)) right = parseFloat(right);
	if (typeof right !== 'number') return;

	switch (type) {
		case Constants.AST_SUB: return (left - right);
		case Constants.AST_MUL: return (left * right);
		case Constants.AST_DIV: return (left / right);
		case Constants.AST_MOD: return (left % right);
	}

}

function processAddition(left, right) {
	// console.info(left, '+', right)



	if (!(typeof left === 'string' || typeof right === 'string')) {

		if (isNumeric(left) || isNumeric(right)) {
			if (isNumeric(left)) left = parseFloat(left);
			if (typeof left !== 'number') return;
			if (isNumeric(right)) right = parseFloat(right);
			if (typeof right !== 'number') return;
			return (left + right);
		}

		if (left instanceof HistoneArray &&
			right instanceof HistoneArray) {
			return array_merge($left, $right);
		}
	}

	return (toString(left) + toString(right));
}

function iterate(collection, retn, retf) {

	if (collection instanceof HistoneArray && collection.values.length) {
		var keys = collection.keys, index = 0, last = collection.values.length - 1;

		forEachAsync(collection.values, function(value, next, index) {
			retn(value, next, keys[index], index, last);
		}, retf);

	} else return true;

}


function toHistone(value) {
	var type = getType(value);
	if (!REGISTERED_TYPES.hasOwnProperty(type)) {
		if (type === 'Array') {
			var result = new HistoneArray();
			for (var c = 0; c < value.length; c++)
				result.push(toHistone(value[c]));
			return result;
		} else if (type === 'Object') {
			var result = new HistoneArray();
			for (var key in value) {
				if (value.hasOwnProperty(key)) {
					result.push(toHistone(value[key]), key);
				}
			}
			return result;
		} else value = undefined;
	}
	return value;
}

function register(type, member, value) {
	if (typeof value !== 'function')
		value = toHistone(value);
	if (typeof value === 'undefined') return;
	if (!REGISTERED_TYPES.hasOwnProperty(type))
		REGISTERED_TYPES[type] = {};
	REGISTERED_TYPES[type][member] = value;
}

function setResourceLoader(resourceLoader) {
	if (typeof resourceLoader !== 'function') return;
	RESOURCE_LOADER = resourceLoader;
}

function loadResource(resouceURI, ret) {
	if (typeof RESOURCE_LOADER !== 'function') ret();
	else RESOURCE_LOADER(resouceURI, ret);
}

module.exports = {

	GET: 0,
	CALL: 1,

	T_BASE: 'base',
	T_UNDEFINED: 'undefined',
	T_NULL: 'null',
	T_BOOLEAN: 'boolean',
	T_NUMBER: 'number',
	T_STRING: 'string',
	T_REGEXP: 'RegExp',
	T_MACRO: 'HistoneMacro',
	T_ARRAY: 'HistoneArray',
	T_GLOBAL: 'HistoneGlobal',


	processAddition: processAddition,
	processEquality: processEquality,
	processRelational: processRelational,
	processArithmetical: processArithmetical,
	processUnaryMinus: processUnaryMinus,

	toString: toString,
	toBoolean: toBoolean,
	toJSON: toJSON,
	iterate: iterate,

	callSync: callSync,
	callAsync: callAsync,

	getGlobal: getGlobal,
	newArray: newArray,
	newMacro: newMacro,

	toHistone: toHistone,
	register: register,
	setResourceLoader: setResourceLoader,
	loadResource: loadResource

};