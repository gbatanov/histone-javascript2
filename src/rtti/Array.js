var RTTI = require('../RTTI.js');

RTTI.register('HistoneArray', 'toString', function(self) {
	return '[ARRAY]';
});

RTTI.register('HistoneArray', 'size', function(self) {
	return self.getSize();
});