var Runtime = require('../Runtime.js');

Runtime.register(Runtime.T_BASE, 'isUndefined', false);
Runtime.register(Runtime.T_BASE, 'isNull', false);
Runtime.register(Runtime.T_BASE, 'isBoolean', false);
Runtime.register(Runtime.T_BASE, 'isNumber', false);
Runtime.register(Runtime.T_BASE, 'isString', false);
Runtime.register(Runtime.T_BASE, 'isArray', false);
Runtime.register(Runtime.T_BASE, 'isRegExp', false);
Runtime.register(Runtime.T_BASE, 'isMacro', false);
Runtime.register(Runtime.T_BASE, 'toString', '');
Runtime.register(Runtime.T_BASE, 'toBoolean', false);
Runtime.register(Runtime.T_BASE, 'toJSON', 'null');