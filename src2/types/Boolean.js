var RTTI = require('../RTTI.js');

RTTI.register(RTTI.T_BOOLEAN, 'isBoolean', true);
RTTI.register(RTTI.T_BOOLEAN, 'toBoolean', function(self) { return self; });
RTTI.register(RTTI.T_BOOLEAN, 'toString', function(self) { return (self ? 'true' : 'false'); });
RTTI.register(RTTI.T_BOOLEAN, 'toJSON', function(self) { return (self ? 'true' : 'false'); });