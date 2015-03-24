var Runtime = require('../Runtime.js');

Runtime.register('RegExp', 'isRegExp', true);
Runtime.register('RegExp', 'toBoolean', true);
Runtime.register('RegExp', 'toString', function(self) { return String(self); });