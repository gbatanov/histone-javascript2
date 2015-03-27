var RTTI = require('../RTTI'),
	RTTI_register = RTTI.register,
	RTTI_T_BOOLEAN = RTTI.T_BOOLEAN;

RTTI_register(RTTI_T_BOOLEAN, 'isBoolean', true);

RTTI_register(RTTI_T_BOOLEAN, 'toBoolean', function(self) {
	return self;
});

RTTI_register(RTTI_T_BOOLEAN, 'toString', function(self) {
	return (self ? 'true' : 'false');
});

RTTI_register(RTTI_T_BOOLEAN, 'toJSON', function(self) {
	return (self ? 'true' : 'false');
});