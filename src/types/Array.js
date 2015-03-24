var Runtime = require('../Runtime.js');

Runtime.register('HistoneArray', 'toString', function(self) {
	return '[ARRAY]';
});

Runtime.register('HistoneArray', 'size', function(self) {
	return self.getSize();
});