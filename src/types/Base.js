var RTTI = require('../RTTI.js'),
	RTTI_register = RTTI.register,
	RTTI_T_BASE = RTTI.T_BASE;

RTTI_register(RTTI_T_BASE, 'isUndefined', false);
RTTI_register(RTTI_T_BASE, 'isNull', false);
RTTI_register(RTTI_T_BASE, 'isBoolean', false);
RTTI_register(RTTI_T_BASE, 'isNumber', false);
RTTI_register(RTTI_T_BASE, 'isString', false);
RTTI_register(RTTI_T_BASE, 'isArray', false);
RTTI_register(RTTI_T_BASE, 'isRegExp', false);
RTTI_register(RTTI_T_BASE, 'isMacro', false);
RTTI_register(RTTI_T_BASE, 'toString', '');
RTTI_register(RTTI_T_BASE, 'toBoolean', false);
RTTI_register(RTTI_T_BASE, 'toJSON', 'null');