var Runtime = require('../Runtime.js');
var HistoneMacro = require('../Macro.js');
var Processor = require('../Processor.js');

Runtime.register(Runtime.T_MACRO, 'isMacro', true);
Runtime.register(Runtime.T_MACRO, 'toBoolean', true);
Runtime.register(Runtime.T_MACRO, 'toString', '(Macro)');


Runtime.register(Runtime.T_MACRO, '__get', '[__get]');
Runtime.register(Runtime.T_MACRO, 'toJSON', '[toJSON]');
Runtime.register(Runtime.T_MACRO, 'extend', '[extend]');
Runtime.register(Runtime.T_MACRO, 'call', '[call]');



Runtime.register(Runtime.T_MACRO, 'bind', function(self, args) {
	var macro = new HistoneMacro(self.params, self.body, self.scope);
	macro.args = (self.args || []).concat(args);
	return macro;
});

Runtime.register(Runtime.T_MACRO, '__call', function(self, args, scope, ret) {

	var macroParams = self.params,
		macroScope = self.scope.extend(),
		callArgs = (self.args || []).concat(args);

	macroScope.putVar(Runtime.toHistone({
		callee: self,
		caller: scope.getBaseURI(),
		arguments: callArgs
	}), 0);

	for (var c = 0; c < macroParams.length; c++) {
		if (callArgs[c] === undefined)
			macroScope.putVar(macroParams[c], c + 1);
		else macroScope.putVar(callArgs[c], c + 1);
	}

	Processor(self.body, macroScope, ret);
}, true);