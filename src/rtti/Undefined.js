var RTTI = require('../RTTI.js');

RTTI.register('undefined', 'isUndefined', true);
RTTI.register('undefined', 'toString', '');
RTTI.register('undefined', 'toBoolean', false);
RTTI.register('undefined', 'toJSON', 'null');