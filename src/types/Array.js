var RTTI = require('../RTTI'),
	Utils = require('../Utils'),
	HistoneMacro = require('../Macro'),
	RTTI_register = RTTI.register,
	RTTI_T_ARRAY = RTTI.T_ARRAY,
	Utils_toInt = Utils.toInt,
	forEachAsync = Utils.forEachAsync;

RTTI_register(RTTI_T_ARRAY, 'isArray', true);
RTTI_register(RTTI_T_ARRAY, 'toBoolean', true);

RTTI_register(RTTI_T_ARRAY, 'toString', function(self) {
	var c, value,  result = [], values = self.values;
	for (c = 0; c < values.length; c++) {
		value = RTTI.toString(values[c]);
		if (value.length) result.push(value);
	}
	return result.join(' ');
});

RTTI_register(RTTI_T_ARRAY, 'toJSON', function(self) {
	var index = 0, result = [], isArray = true,
		keys = self.keys, values = self.values;
	for (var c = 0; c < values.length; c++) {
		result.push(RTTI.toJSON(values[c]));
		if (isArray && keys[c] !== String(index++)) {
			isArray = false;
		}
	}
	if (isArray) return '[' + result.join(',') + ']';
	return '{' + result.map(function(value, index) {
		return JSON.stringify(keys[index]) + ':' + value;
	}).join(',') + '}';
});

RTTI_register(RTTI_T_ARRAY, RTTI.GET, function(self, args) {
	var key = args[0];
	var keyIndex = self.keys.indexOf(key);
	if (keyIndex !== -1) return self.values[keyIndex];
});

RTTI_register(RTTI_T_ARRAY, 'length', function(self) {
	return self.values.length;
});

RTTI_register(RTTI_T_ARRAY, 'keys', function(self) {
	return self.keys;
});

RTTI_register(RTTI_T_ARRAY, 'values', function(self) {
	return self.values;
});




RTTI_register(RTTI_T_ARRAY, 'slice', function(self, args) {

	var values = self.values,
		arrLen = values.length,
		offset = Utils_toInt(args[0]),
		length = Utils_toInt(args[1]);

	if (typeof offset !== 'number') offset = 0;
	if (offset < 0) offset = arrLen + offset;
	if (offset < 0) offset = 0;
	if (offset > arrLen) return [];

	if (typeof length !== 'number') length = 0;
	if (length === 0) length = arrLen - offset;
	if (length < 0) length = arrLen - offset + length;
	if (length <= 0) return [];

	return values.slice(offset, offset + length);
});

RTTI_register(RTTI_T_ARRAY, 'chunk', function(self, args) {
	var size = Utils_toInt(args[0]);
	if (typeof size === 'number' && size > 0) {
		var result = [], values = self.values;
		for (var chunk, c = 0; c < values.length; c++) {
			if (c % size === 0) result.push(chunk = []);
			chunk.push(values[c]);
		}
		return result;
	}
	return self;
});

RTTI_register(RTTI_T_ARRAY, 'join', function(self, args) {
	var result = [], values = self.values, separator = '';
	if (args.length > 0) separator = RTTI.toString(args[0]);
	for (var c = 0; c < values.length; c++)
		result.push(RTTI.toString(values[c]));
	return result.join(separator);
});

RTTI_register(RTTI_T_ARRAY, 'every', function(self, args, scope, ret) {
	var filter = args.shift();
	if (filter instanceof HistoneMacro) {
		var result = false, keys = self.keys;
		forEachAsync(self.values, function(value, next, index) {
			filter.call(args.concat(value, keys[index], self), scope, function(pass) {
				next(result = !RTTI.toBoolean(pass));
			});
		}, function() { ret(!result); });
	} else ret(false);
});

RTTI_register(RTTI_T_ARRAY, 'some', function(self, args, scope, ret) {
	var filter = args.shift();
	if (filter instanceof HistoneMacro) {
		var result = false, keys = self.keys;
		forEachAsync(self.values, function(value, next, index) {
			filter.call(args.concat(value, keys[index], self), scope, function(pass) {
				next(result = RTTI.toBoolean(pass));
			});
		}, function() { ret(result); });
	} else ret(false);
});

RTTI_register(RTTI_T_ARRAY, 'filter', function(self, args, scope, ret) {
	var filter = args.shift();
	if (filter instanceof HistoneMacro) {
		var result = [], keys = self.keys;
		forEachAsync(self.values, function(value, next, index) {
			filter.call(args.concat(value, keys[index], self), scope, function(pass) {
				if (RTTI.toBoolean(pass)) result.push(value);
				next();
			});
		}, function() { ret(result); });
	} else ret([]);
});

RTTI_register(RTTI_T_ARRAY, 'map', function(self, args, scope, ret) {
	var filter = args.shift(), keys = self.keys, result = new Array(keys.length);
	if (filter instanceof HistoneMacro) {
		forEachAsync(self.values, function(value, next, index) {
			filter.call(args.concat(value, keys[index], self), scope, function(value) {
				result[index] = value;
				next();
			});
		}, function() { ret(result); });
	} else ret(result);
});