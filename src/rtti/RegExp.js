var RTTI = require('../RTTI.js');

RTTI.register('RegExp', 'isRegExp', true);
RTTI.register('RegExp', 'toBoolean', true);
RTTI.register('RegExp', 'toString', function(self) { return String(self); });