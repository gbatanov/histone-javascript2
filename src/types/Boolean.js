var Runtime = require('../Runtime.js');

Runtime.register(Runtime.T_BOOLEAN, 'isBoolean', true);
Runtime.register(Runtime.T_BOOLEAN, 'toBoolean', function(self) { return self; });
Runtime.register(Runtime.T_BOOLEAN, 'toString', function(self) { return (self ? 'true' : 'false'); });
Runtime.register(Runtime.T_BOOLEAN, 'toJSON', function(self) { return (self ? 'true' : 'false'); });