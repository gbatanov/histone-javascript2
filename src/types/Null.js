var Runtime = require('../Runtime.js');

Runtime.register(Runtime.T_NULL, 'isNull', true);
Runtime.register(Runtime.T_NULL, 'toString', 'null');
Runtime.register(Runtime.T_NULL, 'toBoolean', false);
Runtime.register(Runtime.T_NULL, 'toJSON', 'null');