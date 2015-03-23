var Constants = require('./Constants.js');
var Parser = require('./parser/Parser.js');

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
		handler = 'type';

	handler = typeInfo[handler];

	if (handler.hasOwnProperty(member))
		return handler[member];

	return typeInfo['type'][member];
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
		if (handler.async)
			handler(value, args, scope, ret);
		else ret(handler(value, args, scope));
	} else ret(handler);
}


function toString(node) {
	return callSync(node, 'toString');
}

function toBoolean(node) {
	return callSync(node, 'toBoolean');
}

function loadResource(resouceURI, ret) {
	if (typeof RESOURCE_LOADER !== 'function') ret();
	else RESOURCE_LOADER(resouceURI, ret);
}

function setResourceLoader(resourceLoader) {
	if (typeof resourceLoader !== 'function') return;
	RESOURCE_LOADER = resourceLoader;
}

function resolveURI(relURI, baseURI) {
	var url = require('url');
	return url.resolve(baseURI, relURI);
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
	if (template instanceof Template)
		return template.getAST();
	return [Constants.AST_NODES];
}



module.exports = {
	parse: parseTemplate,
	register: register,
	call: callAsync,
	toString: toString,
	toBoolean: toBoolean,
	resolveURI: resolveURI,
	loadResource: loadResource,
	setResourceLoader: setResourceLoader
};