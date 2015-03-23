var RTTI = require('./RTTI.js');
var Scope = require('./Scope.js');
var Processor = require('./Processor.js');

function getCallerURI() {
	var prepareStackTrace = Error.prepareStackTrace;
	Error.prepareStackTrace = function(_, stack) { return stack; };
	var error = new Error;
	Error.captureStackTrace(error, arguments.callee);
	var stack = error.stack;
	Error.prepareStackTrace = prepareStackTrace;
	return stack[1].getFileName();
}

function Template(template, baseURI) {
	this.baseURI = baseURI;
	this.template = template;
}

Template.prototype.getAST = function() {
	return this.template;
};

Template.prototype.render = function(ret, thisObj) {
	var scope = new Scope(this.baseURI, thisObj);
	Processor(this.template, scope, ret);
};

function Histone(template, baseURI) {
	if (typeof baseURI !== 'string')
		baseURI = getCallerURI();
	template = RTTI.parse(template, baseURI);
	return new Template(template, baseURI);
}

Histone.setResourceLoader = RTTI.setResourceLoader;

require('./rtti/Type.js');
require('./rtti/Undefined.js');
require('./rtti/Null.js');
require('./rtti/Boolean.js');
require('./rtti/Number.js');
require('./rtti/String.js');
require('./rtti/Array.js');
require('./rtti/RegExp.js');
require('./rtti/Macro.js');
require('./rtti/Global.js');

module.exports = Histone;