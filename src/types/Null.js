var RTTI = require('../RTTI.js'),
	RTTI_register = RTTI.register,
	RTTI_T_NULL = RTTI.T_NULL;

RTTI_register(RTTI_T_NULL, 'isNull', true);
RTTI_register(RTTI_T_NULL, 'toString', 'null');
RTTI_register(RTTI_T_NULL, 'toBoolean', false);
RTTI_register(RTTI_T_NULL, 'toJSON', 'null');