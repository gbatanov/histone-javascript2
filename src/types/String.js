var RTTI = require('../RTTI.js'),
	Utils = require('../Utils.js');

RTTI.register(RTTI.T_STRING, 'isString', true);

RTTI.register(RTTI.T_STRING, 'toBoolean', function(self) {
	return self.length > 0;
});

RTTI.register(RTTI.T_STRING, 'toString', function(self) {
	return self;
});

RTTI.register(RTTI.T_STRING, 'toJSON', function(self) {
	return JSON.stringify(self);
});

RTTI.register(RTTI.T_STRING, RTTI.GET, function(self, args) {
	var index = Utils.toInt(args[0]);
	if (index !== undefined) {
		var length = self.length;
		if (index < 0) index = length + index;
		if (index >= 0 && index < length) {
			return self[index];
		}
	}
});

RTTI.register(RTTI.T_STRING, 'length', function(self) {
	return self.length;
});

RTTI.register(RTTI.T_STRING, 'toLowerCase', function(self) {
	return self.toLowerCase();
});

RTTI.register(RTTI.T_STRING, 'toUpperCase', function(self) {
	return self.toUpperCase();
});

RTTI.register(RTTI.T_STRING, 'split', function(self, args) {
	var separator = args[0];
	if (typeof separator !== 'string') separator = '';
	return self.split(separator);
});

RTTI.register(RTTI.T_STRING, 'charCodeAt', function(self, args) {
	var index = Utils.toInt(args[0]);
	if (typeof index === 'number') {
		var length = self.length;
		if (index < 0) index = length + index;
		if (index >= 0 && index < length) {
			return self.charCodeAt(index);
		}
	}
});

RTTI.register(RTTI.T_STRING, 'toNumber', function(self, args) {
	self = Utils.toNumber(self);
	return (typeof self === 'undefined' ? args[0] : self);
});

RTTI.register(RTTI.T_STRING, 'strip', function(self, args) {
	var arg, chars = '', start = -1, length = self.length;
	while (args.length) if (typeof (arg = args.shift()) === 'string') chars += arg;
	if (chars.length === 0) chars = ' \n\r\t';
	while (start < length && chars.indexOf(self.charAt(++start)) !== -1);
	while (length >= 0 && chars.indexOf(self.charAt(--length)) !== -1);
	return self.slice(start, length + 1);
});

RTTI.register(RTTI.T_STRING, 'slice', function(self, args) {
	var strlen = self.length,
		start = (args.length > 0 ? Utils.toInt(args[0]) : 0),
		length = (args.length > 1 ? Utils.toInt(args[1]) : strlen);
	if (start === undefined || length === undefined) return;
	if (start < 0) start = strlen + start;
	if (start < 0) start = 0;
	if (start >= strlen) return '';
	if (length === 0) length = strlen - start;
	if (length < 0) length = strlen - start + length;
	if (length <= 0) return '';
	return self.substr(start, length);
});