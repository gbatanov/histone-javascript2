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

module.exports = HistoneArray;