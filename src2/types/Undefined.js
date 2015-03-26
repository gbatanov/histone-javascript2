var RTTI = require('../RTTI.js');

RTTI.register(RTTI.T_UNDEFINED, 'isUndefined', true);
RTTI.register(RTTI.T_UNDEFINED, 'toString', '');
RTTI.register(RTTI.T_UNDEFINED, 'toBoolean', false);
RTTI.register(RTTI.T_UNDEFINED, 'toJSON', null);