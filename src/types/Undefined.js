var Runtime = require('../Runtime.js');

Runtime.register(Runtime.T_UNDEFINED, 'isUndefined', true);
Runtime.register(Runtime.T_UNDEFINED, 'toString', '');
Runtime.register(Runtime.T_UNDEFINED, 'toBoolean', false);
Runtime.register(Runtime.T_UNDEFINED, 'toJSON', 'null');