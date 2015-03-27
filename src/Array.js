function HistoneArray() {
	this.keys = [];
	this.values = [];
	this.nextIndex = 0;
}

HistoneArray.prototype.push = function(value, key) {
	if (typeof key === 'undefined') {

		key = String(this.nextIndex++);
		this.keys.push(key);
		this.values.push(value);

	}

	else if (typeof key === 'string') {
		this.keys.push(key);
		this.values.push(value);
	}

	else {
		throw 'x';
	}
};

HistoneArray.prototype.get = function(key) {
	var keyIndex = this.keys.indexOf(key);
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