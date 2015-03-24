var Runtime = require('../Runtime.js');

Runtime.register('null', 'isNull', true);
Runtime.register('null', 'toString', 'null');
Runtime.register('null', 'toBoolean', false);
Runtime.register('null', 'toJSON', 'null');