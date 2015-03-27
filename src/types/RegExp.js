var RTTI = require('../RTTI.js');

RTTI.register(RTTI.T_REGEXP, 'isRegExp', true);
RTTI.register(RTTI.T_REGEXP, 'toBoolean', true);

RTTI.register(RTTI.T_REGEXP, 'toString', function(self) {
	return String(self);
});