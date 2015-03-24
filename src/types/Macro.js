var Runtime = require('../Runtime.js');
var Processor = require('../Processor.js');

Runtime.register(Runtime.T_MACRO, 'isMacro', true);
Runtime.register(Runtime.T_MACRO, 'toBoolean', true);
Runtime.register(Runtime.T_MACRO, 'toString', '(Macro)');

Runtime.register(Runtime.T_MACRO, '__call', function(self, args, scope, ret) {

	var caller = scope.getBaseURI();
	var scope = self.scope.extend();

	// merge binded args and call args
	// var callArgs = [self.args].concat(args);
	var callArgs = [].concat(args);

	scope.putVar('self', {
		// 'callee' => $this,
		// 'caller' => $caller,
		// 'arguments' => $args
	});

	// default parameters
	var params = self.params;
	for (var c = 0; c < params.length; c++) {
		if (callArgs[c] === undefined) {
			scope.putVar(params[c], c + 1);
		} else {
			scope.putVar(callArgs[c], c + 1);
		}
	}

	// console.info(params);

	Processor(self.body, scope, ret);

}, true);