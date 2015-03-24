var fs = require('fs');
var Histone = require('./src/Histone.js');

Histone.setResourceLoader(function(requestURI, ret) {
	console.info('loading', requestURI);
	fs.readFile(requestURI, 'UTF-8', function(error, template) {
		ret(template);
	});
});

fs.readFile('template.tpl', 'UTF-8', function(error, template) {
	template = Histone(template);
	// console.info(JSON.stringify(template.getAST()));
	template.render(function(result) {
		console.info(result);
	}, 'this-object');
});
