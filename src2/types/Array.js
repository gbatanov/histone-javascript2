var RTTI = require('../RTTI.js');


RTTI.register(RTTI.T_ARRAY, 'isArray', true);
RTTI.register(RTTI.T_ARRAY, 'toBoolean', true);

RTTI.register(RTTI.T_ARRAY, 'toString', function(self) {
	var c, value,  result = [], values = self.values;
	for (c = 0; c < values.length; c++) {
		value = RTTI.toString(values[c]);
		if (value.length) result.push(value);
	}
	return result.join(' ');
});

RTTI.register(RTTI.T_ARRAY, 'toJSON', function(self) {

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

RTTI.register(RTTI.T_ARRAY, RTTI.GET, function(self, args) {
	var key = args[0];
	var keyIndex = self.keys.indexOf(key);
	if (keyIndex !== -1) return self.values[keyIndex];
});

RTTI.register(RTTI.T_ARRAY, 'size', function(self) {
	return self.values.length;
});

RTTI.register(RTTI.T_ARRAY, 'keys', function(self) {
	return self.keys;
});

RTTI.register(RTTI.T_ARRAY, 'values', function(self) {
	return self.values;
});

RTTI.register(RTTI.T_ARRAY, 'join', function(self, args) {
	var result = [], values = self.values,
		separator = RTTI.toString(args[0]);
	for (var c = 0; c < values.length; c++)
		result.push(RTTI.toString(values[c]));
	return result.join(separator);
});

RTTI.register(RTTI.T_ARRAY, 'map', function(self, args, scope, ret) {

	var filter = args[0];
	RTTI.callAsync(filter, '__call', [], scope, ret);

}, true);