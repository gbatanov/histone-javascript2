function HistoneMacro(params, body, scope) {
	this.params = params;
	this.body = body;
	this.scope = scope;
	this.args = [];
}

HistoneMacro.prototype.call = function(args, scope, ret) {

	var macroParams = this.params,
		macroScope = this.scope.extend(),
		callArgs = this.args.concat(args);

	macroScope.putVar(scope.toHistone({
		callee: this,
		caller: scope.getBaseURI(),
		arguments: callArgs
	}), 0);

	for (var c = 0; c < macroParams.length; c++) {
		if (callArgs[c] === undefined)
			macroScope.putVar(macroParams[c], c + 1);
		else macroScope.putVar(callArgs[c], c + 1);
	}


	macroScope.process(this.body, ret);
};

HistoneMacro.prototype.clone = function() {
	var result = new HistoneMacro();
	for (var key in this) {
		if (this.hasOwnProperty(key)) {
			result[key] = this[key];
		}
	}
	return result;
};

HistoneMacro.prototype.bind = function(args) {
	if (args instanceof Array && args.length) {
		var macro = this.clone();
		macro.args = macro.args.concat(args);
		return macro;
	}
	return this;
};


module.exports = HistoneMacro;