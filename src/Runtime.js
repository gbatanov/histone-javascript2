var Constants = require('./Constants.js');
var Parser = require('./parser/Parser.js');
var ResolveURI = require('./ResolveURI.js');
var HistoneArray = require('./Array.js');

var typeInfo = {};

var RESOURCE_LOADER = null;

var TPL_REGEXP = new RegExp([
	'^\\s*\\[\\s*',
	Constants.AST_NODES,
	'[^0-9][^]*\\]\\s*$'
].join(''));


function register(type, member, value, async) {
	if (!typeInfo.hasOwnProperty(type)) typeInfo[type] = {};
	if (typeof value === 'function' && async) value.async = true;
	typeInfo[type][member] = value;
}

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

function getHandler(value, member) {

	var handler = (typeof value);

	if (handler === 'number') {
		if (isNaN(value) || !isFinite(value))
			handler = 'undefined';
	} else if (handler === 'object') {
		if (value === null) handler = 'null';
		else handler = value.constructor.name;
	}

	if (!typeInfo.hasOwnProperty(handler))
		handler = 'base';

	handler = typeInfo[handler];

	if (handler.hasOwnProperty(member))
		return handler[member];

	return typeInfo['base'][member];
}


function toHistone(value) {

	if (!typeInfo.hasOwnProperty(getType(value))) {

		if (value instanceof Array) {
			var result = new HistoneArray();
			for (var c = 0; c < value.length; c++)
				result.set(toHistone(value[c]));
			return result;
		}

		else if (value instanceof Object) {
			var result = new HistoneArray();
			for (var key in value) {
				if (value.hasOwnProperty(key)) {
					result.set(toHistone(value[key]), key);
				}
			}
			return result;
		}

		else value = undefined;

	}

	return value;

}

function callSync(value, member, args, scope) {
	var handler = getHandler(value, member);
	if (typeof handler === 'function')
		return handler(value, args, scope);
	return handler;
}

function callAsync(value, member, args, scope, ret) {
	var handler = getHandler(value, member);

	if (typeof handler === 'function') {

		if (handler.async) {
			handler(value, args, scope, function(result) {
				result = toHistone(result);
				ret(result);
			});
		}

		else {
			var result = handler(value, args, scope);
			result = toHistone(result);
			ret(result);
		}

	} else ret(handler);

}


function toString(node) {
	return callSync(node, 'toString');
}

function toBoolean(node) {
	return callSync(node, 'toBoolean');
}

function toJSON(node) {
	return callSync(node, 'toJSON');
}

function loadResource(resouceURI, ret) {
	if (typeof RESOURCE_LOADER !== 'function') ret();
	else RESOURCE_LOADER(resouceURI, ret);
}

function setResourceLoader(resourceLoader) {
	if (typeof resourceLoader !== 'function') return;
	RESOURCE_LOADER = resourceLoader;
}



function parseTemplate(template, baseURI) {

	if (typeof template === 'string') {
		if (TPL_REGEXP.test(template)) try {
			return JSON.parse(template);
		} catch (exception) {}
		return Parser(template, baseURI);
	}

	if (template instanceof Array)
		return template;

	return [Constants.AST_NODES];

}



module.exports = {

	T_BASE: 'base',
	T_UNDEFINED: 'undefined',
	T_NULL: 'null',
	T_BOOLEAN: 'boolean',
	T_NUMBER: 'number',
	T_STRING: 'string',
	T_REGEXP: 'RegExp',
	T_ARRAY: 'HistoneArray',
	T_MACRO: 'HistoneMacro',
	T_GLOBAL: 'HistoneGlobal',

	toJSON: toJSON,
	toString: toString,
	toBoolean: toBoolean,
	toHistone: toHistone,

	register: register,
	call: callAsync,
	resolveURI: ResolveURI,
	loadResource: loadResource,
	parseTemplate: parseTemplate,
	setResourceLoader: setResourceLoader
};