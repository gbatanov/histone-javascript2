var Runtime = require('../Runtime.js');

Runtime.register('boolean', 'isBoolean', true);
Runtime.register('boolean', 'toBoolean', function(self) { return self; });
Runtime.register('boolean', 'toString', function(self) { return (self ? 'true' : 'false'); });
Runtime.register('boolean', 'toJSON', function(self) { return (self ? 'true' : 'false'); });