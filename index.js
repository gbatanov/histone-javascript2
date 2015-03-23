var fs = require('fs');
var Histone = require('./src/Histone.js');
var Parser = require('./src/parser/Parser.js');
var Processor = require('./src/Processor.js');

fs.readFile('template.tpl', 'UTF-8', function(error, template) {

	template = Parser(template);
	console.info(JSON.stringify(template));

	Processor(template, function(result) {
		console.info(result);
	});

});
