var Runtime = require('../Runtime.js');

Runtime.register('number', 'isNumber', true);
Runtime.register('number', 'toBoolean', function(self) { return !!self; });
Runtime.register('number', 'toJSON', function(self) { return JSON.stringify(self); });
Runtime.register('number', 'toAbs', function(self) { return Math.abs(self); });
Runtime.register('number', 'toFloor', function(self) { return Math.floor(self); });
Runtime.register('number', 'toCeil', function(self) { return Math.ceil(self); });
Runtime.register('number', 'toRound', function(self) { return Math.round(self); });
Runtime.register('number', 'isInt', function(self) { return (self % 1 === 0); });
Runtime.register('number', 'isFloat', function(self) { return (self % 1 !== 0); });
Runtime.register('number', 'toChar', function(self) { return String.fromCharCode(self); });
Runtime.register('number', 'toString', function(self) {
	return String(self);
});