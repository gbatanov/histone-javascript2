function HistoneArray(value) {
	this.keys = [];
	this.values = [];
	this.nextIndex = 0;
}

HistoneArray.prototype.getSize = function() {
	return this.keys.length;
};

HistoneArray.prototype.set = function(value, key) {

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

HistoneArray.prototype.dump = function() {
	console.info('');
	console.info('keys =', this.keys);
	console.info('values =', this.values);
	console.info('');
};

module.exports = HistoneArray;