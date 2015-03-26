var Runtime = require('../Runtime.js');
var HistoneArray = require('../Array.js');
var HistoneMacro = require('../Macro.js');
var Utils = require('../Utils.js');

Runtime.register(Runtime.T_ARRAY, 'isArray', true);
Runtime.register(Runtime.T_ARRAY, 'toBoolean', true);

Runtime.register(Runtime.T_ARRAY, 'toString', function(self) {
	var c, value,  result = [], values = self.values;
	for (c = 0; c < values.length; c++) {
		value = Runtime.toString(values[c]);
		if (value.length) result.push(value);
	}
	return result.join(' ');
});

Runtime.register(Runtime.T_ARRAY, 'toJSON', function(self) {

	var index = 0, result = [], isArray = true,
		keys = self.keys, values = self.values;

	for (var c = 0; c < values.length; c++) {
		result.push(Runtime.toJSON(values[c]));
		if (isArray && keys[c] !== String(index++)) {
			isArray = false;
		}
	}

	if (isArray) return '[' + result.join(',') + ']';

	return '{' + result.map(function(value, index) {
		return JSON.stringify(keys[index]) + ':' + value;
	}).join(',') + '}';

});

Runtime.register(Runtime.T_ARRAY, 'size', function(self) {
	return self.values.length;
});

Runtime.register(Runtime.T_ARRAY, '__get', function(self, args) {
	var key = args[0];
	var keyIndex = self.keys.indexOf(key);
	if (keyIndex !== -1) return self.values[keyIndex];
});

Runtime.register(Runtime.T_ARRAY, 'keys', function(self) {
	return self.keys;
});

Runtime.register(Runtime.T_ARRAY, 'values', function(self) {
	return self.values;
});

Runtime.register(Runtime.T_ARRAY, 'join', function(self, args) {
	var result = [], values = self.values,
		separator = Runtime.toString(args[0]);
	for (var c = 0; c < values.length; c++)
		result.push(Runtime.toString(values[c]));
	return result.join(separator);
});

Runtime.register(Runtime.T_ARRAY, 'map', function(self, args, scope, ret) {

	var result = [],
		filter = args[0],
		extraArgs = args.slice(1),
		isMacro = (filter instanceof HistoneMacro);


	var keys = self.keys;
	var values = self.values;

	Utils.forEachAsync(self.values, function(value, next, index) {

		if (isMacro) {
			var callArgs = [value, keys[index], self];
			callArgs = extraArgs.concat(callArgs);
			filter.call(callArgs, scope, function(value) {
				result.push(value);
				next();
			});
		}

		else {
			result.push();
			next();
		}

	}, function() { ret(result); });

}, true);