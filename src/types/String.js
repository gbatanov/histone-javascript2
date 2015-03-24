var Runtime = require('../Runtime.js');

Runtime.register(Runtime.T_STRING, 'isString', true);
Runtime.register(Runtime.T_STRING, 'toString', function(self) { return self; });
Runtime.register(Runtime.T_STRING, 'toBoolean', function(self) { return self.length > 0; });
Runtime.register(Runtime.T_STRING, 'toJSON', function(self) { return JSON.stringify(self); });
Runtime.register(Runtime.T_STRING, 'size', function(self) { return self.length; });
Runtime.register(Runtime.T_STRING, 'toLowerCase', function(self) { return self.toLowerCase(); });
Runtime.register(Runtime.T_STRING, 'toUpperCase', function(self) { return self.toUpperCase(); });