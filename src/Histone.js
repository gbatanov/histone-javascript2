var RTTI = require('./RTTI'),
	Utils = require('./Utils'),
	Network = require('./Network'),
	Template = require('./Template'),
	HistoneArray = require('./Array'),
	HistoneMacro = require('./Macro'),
	Processor = require('./Processor'),
	Parser = require('./parser/Parser');

function getCallerURI() {
	var prepareStackTrace = Error.prepareStackTrace;
	Error.prepareStackTrace = function(_, stack) { return stack; };
	var error = new Error;
	Error.captureStackTrace(error, arguments.callee);
	var stack = error.stack;
	Error.prepareStackTrace = prepareStackTrace;
	return stack[1].getFileName();
}

function Histone(template, baseURI) {
	var callerURI = getCallerURI();
	if (typeof baseURI !== 'string') baseURI = callerURI;
	else baseURI = Utils.resolveURI(baseURI, callerURI);
	if (template instanceof Template) template = template.getAST();
	else template = Parser(template, baseURI);
	return new Template(template, baseURI);
}

Histone.RTTI = RTTI;
Histone.Utils = Utils;
Histone.Parser = Parser;
Histone.Array = HistoneArray;
Histone.Macro = HistoneMacro;
Histone.Processor = Processor;
Histone.loadResource = Network.loadResource;
Histone.setResourceLoader = Network.setResourceLoader;

require('./types/Base');
require('./types/Undefined');
require('./types/Null');
require('./types/Boolean');
require('./types/Number');
require('./types/String');
require('./types/RegExp');
require('./types/Array');
require('./types/Macro');
require('./types/Global');

module.exports = Histone;