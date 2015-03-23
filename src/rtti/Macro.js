var RTTI = require('../RTTI.js');

RTTI.register('HistoneMacro', 'isMacro', true);
RTTI.register('HistoneMacro', 'toBoolean', true);
RTTI.register('HistoneMacro', 'toString', '(Macro)');

RTTI.register('HistoneMacro', '__call', function(self, args, ret, scope) {

	console.info(1, self, args, scope);

});