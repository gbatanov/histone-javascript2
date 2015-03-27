var Utils = require('./Utils'),
	HistoneArray = require('./Array'),
	Constants = require('./Constants');

var isNumeric = Utils.isNumeric;
var forEachAsync = Utils.forEachAsync;

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

module.exports = {

	getGlobal: getGlobal,
	callSync: callSync,
	callAsync: callAsync,



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

	register: register,
	toHistone: toHistone,
	toString: toString,
	toBoolean: toBoolean,
	toJSON: toJSON
};