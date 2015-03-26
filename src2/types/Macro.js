var RTTI = require('../RTTI.js');

RTTI.register(RTTI.T_MACRO, 'isMacro', true);
RTTI.register(RTTI.T_MACRO, 'toBoolean', true);
RTTI.register(RTTI.T_MACRO, 'toString', '(Macro)');


RTTI.register(RTTI.T_MACRO, RTTI.CALL, function(self, args, scope, ret) {

	var macroParams = self.params,
		macroScope = self.scope.extend(),
		callArgs = (self.args || []).concat(args);

	macroScope.putVar(RTTI.toHistone({
		callee: self,
		caller: scope.getBaseURI(),
		arguments: callArgs
	}), 0);

	for (var c = 0; c < macroParams.length; c++) {
		if (callArgs[c] === undefined)
			macroScope.putVar(macroParams[c], c + 1);
		else macroScope.putVar(callArgs[c], c + 1);
	}

	macroScope.process(self.body, ret);

}, true);