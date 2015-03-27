var RTTI = require('../RTTI.js'),
	HistoneArray = require('../Array.js'),
	RTTI_register = RTTI.register,
	RTTI_T_MACRO = RTTI.T_MACRO;

RTTI_register(RTTI_T_MACRO, 'isMacro', true);
RTTI_register(RTTI_T_MACRO, 'toBoolean', true);
RTTI_register(RTTI_T_MACRO, 'toString', '(Macro)');

RTTI_register(RTTI_T_MACRO, RTTI.GET, function(self, args) {
	if ((self = self.props) instanceof HistoneArray) {
		return self.get(args[0]);
	}
});

RTTI_register(RTTI_T_MACRO, 'bind', function(self, args) {
	return self.bind(args);
});

RTTI_register(RTTI_T_MACRO, 'extend', function(self, args) {
	var newProps = args[0], oldProps = self.props;
	if (newProps instanceof HistoneArray) {
		if (oldProps instanceof HistoneArray)
			newProps = oldProps.concat(newProps);
		self = self.clone(); self.props = newProps;
	}
	return self;
});

RTTI_register(RTTI_T_MACRO, RTTI.CALL, function(self, args, scope, ret) {
	self.call(args, scope, ret);
});

RTTI_register(RTTI_T_MACRO, 'call', function(self, args, scope, ret) {
	var callArgs = [];
	for (var c = 0; c < args.length; c++) {
		var arg = args[c];
		if (arg instanceof HistoneArray)
			Array.prototype.push.apply(callArgs, arg.values);
		else callArgs.push(arg);
	}
	self.call(callArgs, scope, ret);
});