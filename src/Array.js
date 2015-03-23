function HistoneArray() {
	this.keys = [];
	this.values = [];
	this.maxIndex = -1;
}

HistoneArray.prototype.getSize = function() {
	return this.keys.length;
};

HistoneArray.prototype.set = function(value, key) {
	if (typeof key === 'undefined') {
		key = String(++this.maxIndex);
		this.keys.push(key);
		this.values.push(value);
	} else {

		throw 'x';

	}
};

module.exports = HistoneArray;