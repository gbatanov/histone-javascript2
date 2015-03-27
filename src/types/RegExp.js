var RTTI = require('../RTTI'),
	RTTI_register = RTTI.register,
	RTTI_T_REGEXP = RTTI.T_REGEXP;

RTTI_register(RTTI_T_REGEXP, 'isRegExp', true);
RTTI_register(RTTI_T_REGEXP, 'toBoolean', true);

RTTI_register(RTTI_T_REGEXP, 'toString', function(self) {
	return String(self);
});