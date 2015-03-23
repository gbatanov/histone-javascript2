var RTTI = require('../RTTI.js');

RTTI.register('null', 'isNull', true);
RTTI.register('null', 'toString', 'null');
RTTI.register('null', 'toBoolean', false);
RTTI.register('null', 'toJSON', 'null');