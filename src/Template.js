var Processor = require('./Processor');

function Template(templateAST, baseURI) {
	this.baseURI = baseURI;
	this.templateAST = templateAST;
}

Template.prototype.getAST = function() {
	return this.templateAST;
};

Template.prototype.render = function(ret, thisObj) {
	var processor = new Processor(this.baseURI, thisObj);
	processor.process(this.templateAST, ret);
};

module.exports = Template;