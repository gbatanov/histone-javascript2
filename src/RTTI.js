var typeInfo = {};

function register(type, member, value, async) {
	if (!typeInfo.hasOwnProperty(type)) typeInfo[type] = {};
	if (typeof value === 'function') value.async = true;
	typeInfo[type][member] = value;
}


function getHandler(value, member) {
	var handler = (typeof value);
	if (handler === 'number') {
		if (isNaN(value) || !isFinite(value))
			handler = 'undefined';
	} else if (handler === 'object') {
		if (value === null) handler = 'null';
		else handler = value.constructor.name;
	}
	if (!typeInfo.hasOwnProperty(handler)) handler = 'type';
	handler = typeInfo[handler];
	if (handler.hasOwnProperty(member)) return handler[member];
}


function callSync(value, member, args, scope) {
	var handler = getHandler(value, member);
	if (typeof handler === 'function')
		return handler(value, args, scope);
	return handler;
}

function callAsync(value, member, args, scope, ret) {
	var handler = getHandler(value, member);
	if (typeof handler === 'function') {
		if (handler.async)
			handler(value, args, ret, scope);
		else ret(handler(value, args, scope));
	} else ret(handler);
}


function toString(node) {
	return callSync(node, 'toString');
}

function toBoolean(node) {
	return callSync(node, 'toBoolean');
}

module.exports = {
	register: register,
	call: callAsync,
	toString: toString,
	toBoolean: toBoolean
};