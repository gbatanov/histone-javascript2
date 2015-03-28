var Utils = require('./Utils');

function HistoneArray() {
	this.keys = [];
	this.values = [];
	this.nextIndex = 0;
}

HistoneArray.prototype.getLength = function() {
	return this.keys.length;
};

HistoneArray.prototype.getValues = function() {
	return this.values;
};

HistoneArray.prototype.forEachAsync = function(retn, retf) {

	var keys = this.keys, index = 0,
		last = this.values.length - 1;

	Utils.forEachAsync(this.values, function(value, next, index) {
		retn(value, next, keys[index], index, last);
	}, retf);

};

HistoneArray.prototype.set = function(value, key) {
	if (typeof key === 'undefined') {
		key = String(this.nextIndex++);
		this.keys.push(key);
		this.values.push(value);
	} else {
		this.keys.push(key);
		this.values.push(value);
	}
};

HistoneArray.prototype.get = function(key) {
	var keyIndex = this.keys.indexOf(String(key));
	if (keyIndex !== -1) return this.values[keyIndex];
};

HistoneArray.prototype.concat = function() {

	var keys = [].concat(this.keys);
	var values = [].concat(this.values);

	for (var c = 0; c < arguments.length; c++) {
		var argument = arguments[c];
		if (argument instanceof HistoneArray) {
			keys = keys.concat(argument.keys);
			values = values.concat(argument.values);
		}
	}

	var result = new HistoneArray();
	result.keys = keys;
	result.values = values;
	return result;

};

HistoneArray.prototype.toJavaScript = function() {

	var keys = this.keys, values = this.values;
	var result = {};

	for (var c = 0; c < values.length; c++) {
		var value = values[c];
		if (value instanceof HistoneArray)
			value = value.toJavaScript();
		result[keys[c]] = value;
	}

	return result;


};

module.exports = HistoneArray;