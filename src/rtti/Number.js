var RTTI = require('../RTTI.js');

RTTI.register('number', 'isNumber', true);
RTTI.register('number', 'toBoolean', function(self) { return !!self; });
RTTI.register('number', 'toJSON', function(self) { return JSON.stringify(self); });
RTTI.register('number', 'toAbs', function(self) { return Math.abs(self); });
RTTI.register('number', 'toFloor', function(self) { return Math.floor(self); });
RTTI.register('number', 'toCeil', function(self) { return Math.ceil(self); });
RTTI.register('number', 'toRound', function(self) { return Math.round(self); });
RTTI.register('number', 'isInt', function(self) { return (self % 1 === 0); });
RTTI.register('number', 'isFloat', function(self) { return (self % 1 !== 0); });
RTTI.register('number', 'toChar', function(self) { return String.fromCharCode(self); });
RTTI.register('number', 'toString', function(self) {
	return String(self);
});