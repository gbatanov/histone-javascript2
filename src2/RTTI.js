var Utils = require('./Utils.js');
var HistoneMacro = require('./Macro.js');
var HistoneArray = require('./Array.js');
var isNumeric = Utils.isNumeric;
var forEachAsync = Utils.forEachAsync;

var RESOURCE_LOADER = null;

function HistoneGlobal() {}
var globalObject = new HistoneGlobal();


var REGISTERED_TYPES = {

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

function toHistone(value) {

	if (!REGISTERED_TYPES.hasOwnProperty(getType(value))) {

		if (value instanceof Array) {
			var result = new HistoneArray();
			for (var c = 0; c < value.length; c++)
				result.push(toHistone(value[c]));
			return result;
		}

		else if (value instanceof Object) {
			var result = new HistoneArray();
			for (var key in value) {
				if (value.hasOwnProperty(key)) {
					result.push(toHistone(value[key]), key);
				}
			}
			return result;
		}

		else value = undefined;

	}

	return value;

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

		if (!result.async) {

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


function register(type, member, value, async) {
	if (!REGISTERED_TYPES.hasOwnProperty(type))
		REGISTERED_TYPES[type] = {};
	REGISTERED_TYPES[type][member] = value;
	if (typeof value === 'function' && async) {
		value.async = true;
	}
}


function processArithmetical(type, left, right) {
	if (!(typeof left === 'string' && typeof right === 'string')) {
		if (typeof left === 'number' || typeof right === 'number') {
			if (isNumeric(left)) left = parseFloat(left);
			if (typeof left !== 'number') return;
			if (isNumeric(right)) right = parseFloat(right);
			if (typeof right !== 'number') return;
			return (left + right);
		} else if (left instanceof HistoneArray &&
			right instanceof HistoneArray) {
			var result = left.clone();
			result = result.concat(right);
			return result;
		}
	}
	return toString(left) + toString(right);
}

function processUnaryMinus(value) {
	value = Utils.toNumber(value);
	if (typeof value === 'number') return (-value);
}

function setResourceLoader(resourceLoader) {
	if (typeof resourceLoader !== 'function') return;
	RESOURCE_LOADER = resourceLoader;
}

function loadResource(resouceURI, ret) {
	if (typeof RESOURCE_LOADER !== 'function') ret();
	else RESOURCE_LOADER(resouceURI, ret);
}

function iterate(collection, retn, retf) {

	if (collection instanceof HistoneArray && collection.values.length) {
		var keys = collection.keys, index = 0, last = collection.values.length - 1;

		forEachAsync(collection.values, function(value, next, index) {
			retn(value, next, keys[index], index, last);
		}, retf);

	} else return true;

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


	processArithmetical: processArithmetical,
	processUnaryMinus: processUnaryMinus,

	toString: toString,
	toBoolean: toBoolean,
	toJSON: toJSON,
	toHistone: toHistone,
	iterate: iterate,

	callSync: callSync,
	callAsync: callAsync,

	register: register,

	getGlobal: getGlobal,
	newArray: newArray,
	newMacro: newMacro,

	setResourceLoader: setResourceLoader,
	loadResource: loadResource
};