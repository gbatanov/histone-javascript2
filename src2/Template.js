var Runtime = require('./Runtime.js');

function Template(templateAST, baseURI) {
	this.baseURI = baseURI;
	this.templateAST = templateAST;
}

Template.prototype.getAST = function() {
	return this.templateAST;
};

Template.prototype.render = function(ret, thisObj) {
	var runtime = new Runtime(this.baseURI, thisObj);
	runtime.process(this.templateAST, ret);
};

module.exports = Template;