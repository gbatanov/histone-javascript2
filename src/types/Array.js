var Runtime = require('../Runtime.js');

Runtime.register(Runtime.T_ARRAY, 'isArray', true);
Runtime.register(Runtime.T_ARRAY, 'toBoolean', true);

Runtime.register(Runtime.T_ARRAY, 'toString', function(self) {
	return '[ARRAY]';
});

Runtime.register(Runtime.T_ARRAY, 'size', function(self) {
	return self.getSize();
});