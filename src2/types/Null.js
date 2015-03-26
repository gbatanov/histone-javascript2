var RTTI = require('../RTTI.js');

RTTI.register(RTTI.T_NULL, 'isNull', true);
RTTI.register(RTTI.T_NULL, 'toString', 'null');
RTTI.register(RTTI.T_NULL, 'toBoolean', false);
RTTI.register(RTTI.T_NULL, 'toJSON', 'null');