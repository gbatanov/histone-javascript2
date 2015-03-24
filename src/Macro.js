function HistoneMacro(params, body, scope) {

	this.params = params;
	this.body = body;
	this.scope = scope;
	this.args = [];
	this.props = null;

}

module.exports = HistoneMacro;