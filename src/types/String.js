var RTTI = require('../RTTI'),
	Utils = require('../Utils'),
	HistoneMacro = require('../Macro'),
	RTTI_register = RTTI.register,
	RTTI_T_STRING = RTTI.T_STRING,
	Utils_toInt = Utils.toInt;

RTTI_register(RTTI_T_STRING, 'isString', true);

RTTI_register(RTTI_T_STRING, 'toBoolean', function(self) {
	return self.length > 0;
});

RTTI_register(RTTI_T_STRING, 'toString', function(self) {
	return self;
});

RTTI_register(RTTI_T_STRING, 'toJSON', function(self) {
	return JSON.stringify(self);
});

RTTI_register(RTTI_T_STRING, RTTI.GET, function(self, args) {
	var index = Utils_toInt(args[0]);
	if (index !== undefined) {
		var length = self.length;
		if (index < 0) index = length + index;
		if (index >= 0 && index < length) {
			return self[index];
		}
	}
});

RTTI_register(RTTI_T_STRING, 'length', function(self) {
	return self.length;
});

RTTI_register(RTTI_T_STRING, 'toLowerCase', function(self) {
	return self.toLowerCase();
});

RTTI_register(RTTI_T_STRING, 'toUpperCase', function(self) {
	return self.toUpperCase();
});

RTTI_register(RTTI_T_STRING, 'split', function(self, args) {
	var separator = args[0];
	if (typeof separator !== 'string') separator = '';
	return self.split(separator);
});

RTTI_register(RTTI_T_STRING, 'charCodeAt', function(self, args) {
	var index = Utils_toInt(args[0]);
	if (typeof index === 'number') {
		var length = self.length;
		if (index < 0) index = length + index;
		if (index >= 0 && index < length) {
			return self.charCodeAt(index);
		}
	}
});

RTTI_register(RTTI_T_STRING, 'toNumber', function(self, args) {
	self = Utils.toNumber(self);
	return (typeof self === 'undefined' ? args[0] : self);
});

RTTI_register(RTTI_T_STRING, 'strip', function(self, args) {
	var arg, chars = '', start = -1, length = self.length;
	while (args.length) if (typeof (arg = args.shift()) === 'string') chars += arg;
	if (chars.length === 0) chars = ' \n\r\t';
	while (start < length && chars.indexOf(self.charAt(++start)) !== -1);
	while (length >= 0 && chars.indexOf(self.charAt(--length)) !== -1);
	return self.slice(start, length + 1);
});

RTTI_register(RTTI_T_STRING, 'slice', function(self, args) {
	var strlen = self.length,
		start = (args.length > 0 ? Utils_toInt(args[0]) : 0),
		length = (args.length > 1 ? Utils_toInt(args[1]) : strlen);
	if (start === undefined || length === undefined) return;
	if (start < 0) start = strlen + start;
	if (start < 0) start = 0;
	if (start >= strlen) return '';
	if (length === 0) length = strlen - start;
	if (length < 0) length = strlen - start + length;
	if (length <= 0) return '';
	return self.substr(start, length);
});

RTTI_register(RTTI_T_STRING, 'replace', function(self, args, scope, ret) {

	var search = args[0], replace = args[1];

	if (typeof search === 'string') {
		search = search.replace(REGEXP_ESCAPE, '\\$1');
		search = new RegExp(search, 'g');
	}

	if (!(search instanceof RegExp)) return ret(self);

	if (!(replace instanceof HistoneMacro)) {
		replace = RTTI.toString(replace);
		return ret(self.replace(search, replace));
	}


	var result = '', lastPos = 0;
	Utils.loopAsync(function(next) {

		var match = search.exec(self);

		if (match) {

			if (lastPos < match.index)
				result += self.slice(lastPos, match.index);

			lastPos = match.index + match[0].length;

			replace.call([match[0]], scope, function(replace) {
				result += replace;
				next();
			});




		} else next(true);

	}, function() { ret(result); });

});