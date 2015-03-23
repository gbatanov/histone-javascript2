var HistoneString = require('./rtti/String.js');

var typeInfo = {

	'string': {

		'__get': function(self, args, ret) {
			ret(self[args[0]]);
		},

		'split': function(self, args, ret) {
			ret(self.split(''));
		}

	},

	'number': {

		round: function(self, args, ret) {
			ret('round-result');
		}

	}

};

function getType(value) {

	if (value === null) return 'null';
	if (typeof value === 'number') return 'number';
	if (typeof value === 'string') return 'string';

	return value.constructor.name;

}

function toString(node) {
	return String(node);
}

function toBoolean(node) {
	console.info('toBoolean', node);
	return Boolean(node);
}

function call(object, name, args, scope, ret) {

	var type = getType(object);
	console.info(type);

	var handler = typeInfo[type][name];
	handler(object, args, ret, scope);

}

module.exports = {
	call: call,
	toString: toString,
	toBoolean: toBoolean
};