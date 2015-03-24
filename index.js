var fs = require('fs');
var Histone = require('./src/Histone.js');

Histone.register(Histone.T_GLOBAL, 'testMethod', function(self, args) { return '[testMethod]'; });

Histone.setResourceLoader(function(requestURI, ret) {
	console.info('loading', requestURI);
	fs.readFile(requestURI, 'UTF-8', function(error, template) {
		ret(template);
	});
});

fs.readFile('template.tpl', 'UTF-8', function(error, template) {
	Histone(template).render(function(result) {
		console.info(result);
	});
});
