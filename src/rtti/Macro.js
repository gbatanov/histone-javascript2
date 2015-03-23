var RTTI = require('../RTTI.js');
var Processor = require('../Processor.js');

RTTI.register('HistoneMacro', 'isMacro', true);
RTTI.register('HistoneMacro', 'toBoolean', true);
RTTI.register('HistoneMacro', 'toString', '(Macro)');

RTTI.register('HistoneMacro', '__call', function(self, args, scope, ret) {

	scope = self.scope.extend();
	scope.putVar('self', 10);
	Processor.process(self.body, scope, ret);

}, true);