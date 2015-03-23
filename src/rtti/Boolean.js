var RTTI = require('../RTTI.js');

RTTI.register('boolean', 'isBoolean', true);
RTTI.register('boolean', 'toBoolean', function(self) { return self; });
RTTI.register('boolean', 'toString', function(self) { return (self ? 'true' : 'false'); });
RTTI.register('boolean', 'toJSON', function(self) { return (self ? 'true' : 'false'); });