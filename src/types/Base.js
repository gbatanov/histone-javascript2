var Runtime = require('../Runtime.js');

Runtime.register('type', 'isUndefined', false);
Runtime.register('type', 'isNull', false);
Runtime.register('type', 'isBoolean', false);
Runtime.register('type', 'isNumber', false);
Runtime.register('type', 'isString', false);
Runtime.register('type', 'isArray', false);
Runtime.register('type', 'isRegExp', false);
Runtime.register('type', 'isMacro', false);
Runtime.register('type', 'toString', '');
Runtime.register('type', 'toBoolean', false);
Runtime.register('type', 'toJSON', 'null');