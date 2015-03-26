var Runtime = require('./Runtime.js'),
	Template = require('./Template.js');

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
	if (template instanceof Template) template = template.getAST();
	else template = Runtime.parseTemplate(template, baseURI);
	return new Template(template, baseURI);
}

Histone.T_BASE = Runtime.T_BASE;
Histone.T_UNDEFINED = Runtime.T_UNDEFINED;
Histone.T_NULL = Runtime.T_NULL;
Histone.T_BOOLEAN = Runtime.T_BOOLEAN;
Histone.T_NUMBER = Runtime.T_NUMBER;
Histone.T_STRING = Runtime.T_STRING;
Histone.T_REGEXP = Runtime.T_REGEXP;
Histone.T_ARRAY = Runtime.T_ARRAY;
Histone.T_MACRO = Runtime.T_MACRO;
Histone.T_GLOBAL = Runtime.T_GLOBAL;

Histone.register = Runtime.register;
Histone.setResourceLoader = Runtime.setResourceLoader;

require('./types/Base.js');
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