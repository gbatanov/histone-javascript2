var Scope = require('./Scope.js'),
	Processor = require('./Processor.js');

function Template(templateAST, baseURI) {
	this.baseURI = baseURI;
	this.templateAST = templateAST;
}

Template.prototype.getAST = function() {
	return this.templateAST;
};

Template.prototype.render = function(ret, thisObj) {
	var scope = new Scope(this.baseURI, thisObj);
	Processor(this.templateAST, scope, ret);
};

module.exports = Template;