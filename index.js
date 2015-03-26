var fs = require('fs');
var Histone = require('./src2/Histone.js');

Histone.setResourceLoader(function(requestURI, ret) {
	console.info('loading', requestURI);
	fs.readFile(requestURI, 'UTF-8', function(error, template) {
		ret(template);
	});
});


fs.readFile('template.tpl', 'UTF-8', function(error, template) {
	template = Histone(template);
	// var start = new Date().getTime();
	// console.info(JSON.stringify(template.getAST()));
	template.render(function(result) {
		// console.info(new Date().getTime() - start);
		console.info(result);
	}, {
		_undef: undefined,
		_null: null,
		_true: true,
		_false: false,
		_number: 10,
		_string: 'string',
		_array: [1, 2, 3]
	});
});
