var RTTI = require('../RTTI.js');

RTTI.register('string', 'isString', true);
RTTI.register('string', 'toString', function(self) { return self; });
RTTI.register('string', 'toBoolean', function(self) { return self.length > 0; });
RTTI.register('string', 'toJSON', function(self) { return JSON.stringify(self); });
RTTI.register('string', 'size', function(self) { return self.length; });
RTTI.register('string', 'toLowerCase', function(self) { return self.toLowerCase(); });
RTTI.register('string', 'toUpperCase', function(self) { return self.toUpperCase(); });