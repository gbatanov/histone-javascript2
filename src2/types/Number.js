var RTTI = require('../RTTI.js'),
	Utils = require('../Utils.js');

RTTI.register(RTTI.T_NUMBER, 'isNumber', true);

RTTI.register(RTTI.T_NUMBER, 'toBoolean', function(self) {
	return !!self;
});

RTTI.register(RTTI.T_NUMBER, 'toString', function(self) {
	return String(self);
});

RTTI.register(RTTI.T_NUMBER, 'toJSON', function(self) {
	return JSON.stringify(self);
});

RTTI.register(RTTI.T_NUMBER, 'toAbs', function(self) {
	return Math.abs(self);
});

RTTI.register(RTTI.T_NUMBER, 'toFloor', function(self) {
	return Math.floor(self);
});

RTTI.register(RTTI.T_NUMBER, 'toCeil', function(self) {
	return Math.ceil(self);
});

RTTI.register(RTTI.T_NUMBER, 'toRound', function(self) {
	return Math.round(self);
});

RTTI.register(RTTI.T_NUMBER, 'isInt', function(self) {
	return (self % 1 === 0);
});

RTTI.register(RTTI.T_NUMBER, 'isFloat', function(self) {
	return (self % 1 !== 0);
});

RTTI.register(RTTI.T_NUMBER, 'toChar', function(self) {
	return String.fromCharCode(self);
});

RTTI.register(RTTI.T_NUMBER, 'toFixed', function(self, args) {
	var digits = Utils.toInt(args[0]);
	return (digits !== undefined && digits >= 0 ? self.toFixed(digits) : self);
});