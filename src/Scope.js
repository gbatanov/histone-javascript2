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

Scope.prototype.getVar = function(level, index) {
	var scope = this;
	while (level--) scope = scope.parent;
	return scope.variables[index];
};

Scope.prototype.extend = function() {
	console.info('Scope.prototype.extend()');
	var scope = new Scope(this.baseURI, this.thisObj);
	scope.parent = this;
	return scope;
};

module.exports = Scope;