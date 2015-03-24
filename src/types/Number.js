var Runtime = require('../Runtime.js');

Runtime.register(Runtime.T_NUMBER, 'isNumber', true);
Runtime.register(Runtime.T_NUMBER, 'toBoolean', function(self) { return !!self; });
Runtime.register(Runtime.T_NUMBER, 'toJSON', function(self) { return JSON.stringify(self); });
Runtime.register(Runtime.T_NUMBER, 'toAbs', function(self) { return Math.abs(self); });
Runtime.register(Runtime.T_NUMBER, 'toFloor', function(self) { return Math.floor(self); });
Runtime.register(Runtime.T_NUMBER, 'toCeil', function(self) { return Math.ceil(self); });
Runtime.register(Runtime.T_NUMBER, 'toRound', function(self) { return Math.round(self); });
Runtime.register(Runtime.T_NUMBER, 'isInt', function(self) { return (self % 1 === 0); });
Runtime.register(Runtime.T_NUMBER, 'isFloat', function(self) { return (self % 1 !== 0); });
Runtime.register(Runtime.T_NUMBER, 'toChar', function(self) { return String.fromCharCode(self); });
Runtime.register(Runtime.T_NUMBER, 'toString', function(self) {
	return String(self);
});