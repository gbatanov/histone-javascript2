var RTTI = require('../RTTI'),
	RTTI_register = RTTI.register,
	RTTI_T_UNDEFINED = RTTI.T_UNDEFINED;

RTTI_register(RTTI_T_UNDEFINED, 'isUndefined', true);
RTTI_register(RTTI_T_UNDEFINED, 'toString', '');
RTTI_register(RTTI_T_UNDEFINED, 'toBoolean', false);
RTTI_register(RTTI_T_UNDEFINED, 'toJSON', null);