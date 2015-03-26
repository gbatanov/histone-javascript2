var RTTI = require('../RTTI.js');

RTTI.register(RTTI.T_BASE, 'isUndefined', false);
RTTI.register(RTTI.T_BASE, 'isNull', false);
RTTI.register(RTTI.T_BASE, 'isBoolean', false);
RTTI.register(RTTI.T_BASE, 'isNumber', false);
RTTI.register(RTTI.T_BASE, 'isString', false);
RTTI.register(RTTI.T_BASE, 'isArray', false);
RTTI.register(RTTI.T_BASE, 'isRegExp', false);
RTTI.register(RTTI.T_BASE, 'isMacro', false);
RTTI.register(RTTI.T_BASE, 'toString', '');
RTTI.register(RTTI.T_BASE, 'toBoolean', false);
RTTI.register(RTTI.T_BASE, 'toJSON', 'null');