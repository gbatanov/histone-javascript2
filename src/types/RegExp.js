var Runtime = require('../Runtime.js');

Runtime.register(Runtime.T_REGEXP, 'isRegExp', true);
Runtime.register(Runtime.T_REGEXP, 'toBoolean', true);
Runtime.register(Runtime.T_REGEXP, 'toString', function(self) { return String(self); });