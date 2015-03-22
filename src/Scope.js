function Scope(baseURI, thisObj) {
	this.parent = null;
	this.variables = {};
	this.baseURI = baseURI;
	this.thisObj = thisObj;
}

Scope.prototype.getBaseURI = function() {
	return this.baseURI;
};

Scope.prototype.getThis = function() {
	return this.thisObj;
};

Scope.prototype.putVar = function(value, index) {
	this.variables[index] = value;
};

Scope.prototype.getVar = function(scope, index) {
	var frame = this;
	while (scope--) frame = frame.parent;
	return frame.variables[index];
};

Scope.prototype.extend = function() {
	var frame = new Scope(this.baseURI, this.thisObj);
	frame.parent = this;
	return frame;
};

module.exports = Scope;