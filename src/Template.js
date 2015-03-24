var Scope = require('./Scope.js'),
	Processor = require('./Processor.js');

function Template(template, baseURI) {
	this.baseURI = baseURI;
	this.template = template;
}

Template.prototype.getAST = function() {
	return this.template;
};

Template.prototype.render = function(ret, thisObj) {
	var scope = new Scope(this.baseURI, thisObj);
	Processor(this.template, scope, ret);
};

module.exports = Template;