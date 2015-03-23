var RTTI = require('../RTTI.js');

RTTI.register('type', 'isUndefined', false);
RTTI.register('type', 'isNull', false);
RTTI.register('type', 'isBoolean', false);
RTTI.register('type', 'isNumber', false);
RTTI.register('type', 'isString', false);
RTTI.register('type', 'isArray', false);
RTTI.register('type', 'isRegExp', false);
RTTI.register('type', 'isMacro', false);
RTTI.register('type', 'toString', '');
RTTI.register('type', 'toBoolean', false);
RTTI.register('type', 'toJSON', 'null');