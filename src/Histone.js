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
	template = Runtime.parseTemplate(template, baseURI);
	return new Template(template, baseURI);
}

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