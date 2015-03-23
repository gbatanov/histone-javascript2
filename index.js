var fs = require('fs');
var Parser = require('./src/parser/Parser.js');

fs.readFile('template.tpl', 'UTF-8', function(error, template) {
	template = Parser(template);
	console.info(JSON.stringify(template));
});
