var Runtime = require('../Runtime.js');
var Processor = require('../Processor.js');

Runtime.register('HistoneMacro', 'isMacro', true);
Runtime.register('HistoneMacro', 'toBoolean', true);
Runtime.register('HistoneMacro', 'toString', '(Macro)');

Runtime.register('HistoneMacro', '__call', function(self, args, scope, ret) {

	scope = self.scope.extend();
	scope.putVar('self', 10);
	Processor.process(self.body, scope, ret);

}, true);