var Runtime = require('./Runtime.js'),
	Template = require('./Template.js'),
	Constants = require('./Constants.js');

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
	if (typeof baseURI !== 'string') baseURI = getCallerURI();
	template = Runtime.parseTemplate(template, baseURI);
	return new Template(template, baseURI);
}

Histone.T_BASE = Constants.T_BASE;
Histone.T_UNDEFINED = Constants.T_UNDEFINED;
Histone.T_NULL = Constants.T_NULL;
Histone.T_BOOLEAN = Constants.T_BOOLEAN;
Histone.T_NUMBER = Constants.T_NUMBER;
Histone.T_STRING = Constants.T_STRING;
Histone.T_REGEXP = Constants.T_REGEXP;
Histone.T_ARRAY = Constants.T_ARRAY;
Histone.T_MACRO = Constants.T_MACRO;
Histone.T_GLOBAL = Constants.T_GLOBAL;

Histone.register = Runtime.register;
Histone.setResourceLoader = Runtime.setResourceLoader;

require('./types/Type.js');
require('./types/Undefined.js');
require('./types/Null.js');
require('./types/Boolean.js');
require('./types/Number.js');
require('./types/String.js');
require('./types/Array.js');
require('./types/RegExp.js');
require('./types/Macro.js');
require('./types/Global.js');

module.exports = Histone;