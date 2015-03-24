var Runtime = require('../Runtime.js');

Runtime.register('string', 'isString', true);
Runtime.register('string', 'toString', function(self) { return self; });
Runtime.register('string', 'toBoolean', function(self) { return self.length > 0; });
Runtime.register('string', 'toJSON', function(self) { return JSON.stringify(self); });
Runtime.register('string', 'size', function(self) { return self.length; });
Runtime.register('string', 'toLowerCase', function(self) { return self.toLowerCase(); });
Runtime.register('string', 'toUpperCase', function(self) { return self.toUpperCase(); });