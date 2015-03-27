var RTTI = require('../RTTI.js'),
	Utils = require('../Utils.js'),
	RTTI_register = RTTI.register,
	RTTI_T_NUMBER = RTTI.T_NUMBER,
	Utils_toInt = Utils.toInt;

RTTI_register(RTTI_T_NUMBER, 'isNumber', true);

RTTI_register(RTTI_T_NUMBER, 'toBoolean', function(self) {
	return !!self;
});

RTTI_register(RTTI_T_NUMBER, 'toString', function(self) {
	var value = String(self).split(/[eE]/);
	if (value.length === 1) return value[0];
	var result = '';
	var numeric = value[0].replace('.', '');
	var exponent = Number(value[1]) + 1;
	if (exponent < 0) {
		if (self < 0) result += '-';
		result += '0.';
		while (exponent++) result += '0';
		return result + numeric.replace(/^\-/,'');
	}
	exponent -= numeric.length;
	while (exponent--) result += '0';
	return numeric + result;
});

RTTI_register(RTTI_T_NUMBER, 'toJSON', function(self) {
	return JSON.stringify(self);
});

RTTI_register(RTTI_T_NUMBER, 'toAbs', function(self) {
	return Math.abs(self);
});

RTTI_register(RTTI_T_NUMBER, 'toFloor', function(self) {
	return Math.floor(self);
});

RTTI_register(RTTI_T_NUMBER, 'toCeil', function(self) {
	return Math.ceil(self);
});

RTTI_register(RTTI_T_NUMBER, 'toRound', function(self) {
	return Math.round(self);
});

RTTI_register(RTTI_T_NUMBER, 'isInt', function(self) {
	return (self % 1 === 0);
});

RTTI_register(RTTI_T_NUMBER, 'isFloat', function(self) {
	return (self % 1 !== 0);
});

RTTI_register(RTTI_T_NUMBER, 'toChar', function(self) {
	var value = Utils_toInt(self);
	if (typeof value === 'number' && value >= 0) {
		return String.fromCharCode(self);
	}
});

RTTI_register(RTTI_T_NUMBER, 'toFixed', function(self, args) {
	var digits = Utils_toInt(args[0]);
	if (typeof digits !== 'number') digits = 0;
	return (digits >= 0 ? self.toFixed(digits) : self);
});