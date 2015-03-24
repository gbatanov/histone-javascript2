var Runtime = require('../Runtime.js');

Runtime.register('undefined', 'isUndefined', true);
Runtime.register('undefined', 'toString', '');
Runtime.register('undefined', 'toBoolean', false);
Runtime.register('undefined', 'toJSON', 'null');