var Runtime = require('../Runtime.js');
var Processor = require('../Processor.js');

Runtime.register(Runtime.T_MACRO, 'isMacro', true);
Runtime.register(Runtime.T_MACRO, 'toBoolean', true);
Runtime.register(Runtime.T_MACRO, 'toString', '(Macro)');

Runtime.register(Runtime.T_MACRO, '__call', function(self, args, scope, ret) {

	scope = self.scope.extend();
	scope.putVar('self', 10);
	Processor.process(self.body, scope, ret);

}, true);