function forEachAsync(list, iterator, ret, start, step) {
	if (!(list instanceof Object)) return ret();
	if (!start) start = 0;

	if (!step) step = 1;

	var keys, key, length;
	var i = -step + start, calls = 0, looping = false;
	if (list instanceof Array) {
		length = list.length;
	} else {
		keys = Object.keys(list);
		length = keys.length;
	}

	var resume = function() {
		calls += 1;
		if (looping) return;
		looping = true;

		while (calls > 0) {
			calls -= 1, i += step;
			if (i >= length) return ret();
			key = (keys ? keys[i] : i);
			iterator(list[key], function(stop) {
				if (stop === true) ret();
				else resume();
			}, key);
		}

		looping = false;
	};

	resume();
}


module.exports = {
	forEachAsync: forEachAsync
};