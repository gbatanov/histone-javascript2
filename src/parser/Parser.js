var Tokenizer = require('./Tokenizer.js');
var Constants = require('../Constants.js');

const T_NOP = -1;
const T_BREAK = -2;
const T_ARRAY = -3;

var tokenizer;
// used to validate regular expression flags
var validRegexpFlags = /^(?:([gim])(?!.*\1))*$/;
// used to convert control characters into regular characters
var stringEscapeRegExp = /\\(x[0-9A-F]{2}|u[0-9A-F]{4}|\n|.)/g;

function tokenize(input, baseURI) {
	if (!tokenizer) {
		tokenizer = new Tokenizer();
		tokenizer.add('PROP', 'null\\b');
		tokenizer.add('PROP', 'true\\b');
		tokenizer.add('PROP', 'false\\b');
		tokenizer.add(['PROP', 'STATEMENT'], 'if\\b');
		tokenizer.add(['PROP', 'STATEMENT'], 'in\\b');
		tokenizer.add(['PROP', 'STATEMENT'], 'for\\b');
		tokenizer.add(['PROP', 'STATEMENT'], 'var\\b');
		tokenizer.add(['PROP', 'STATEMENT'], 'else\\b');
		tokenizer.add(['PROP', 'STATEMENT'], 'macro\\b');
		tokenizer.add(['PROP', 'STATEMENT'], 'elseif\\b');
		tokenizer.add(['PROP', 'STATEMENT'], 'return\\b');
		tokenizer.add('HEX', /0[xX][0-9A-Fa-f]+/);
		tokenizer.add('FLOAT', /(?:[0-9]*\.)?[0-9]+[eE][+-]?[0-9]+/);
		tokenizer.add('FLOAT', /[0-9]*\.[0-9]+/);
		tokenizer.add('INT', /[0-9]+/);
		tokenizer.add(['PROP', 'REF'], 'this\\b');
		tokenizer.add(['PROP', 'REF'], 'self\\b');
		tokenizer.add(['PROP', 'REF'], 'global\\b');
		tokenizer.add(['PROP', 'REF', 'VAR'], /[_$a-zA-Z][_$a-zA-Z0-9]*/);
		tokenizer.add(['SPACES', 'EOL'], /[\x0A\x0D]+/);
		tokenizer.add('SPACES', /[\x09\x20]+/);
		tokenizer.add('{{%');
		tokenizer.add('%}}');
		tokenizer.add('{{*');
		tokenizer.add('*}}');
		tokenizer.add('}}');
		tokenizer.add('{{');
		tokenizer.add('->');
		tokenizer.add('!=');
		tokenizer.add('||');
		tokenizer.add('&&');
		tokenizer.add('!');
		tokenizer.add('"');
		tokenizer.add("'");
		tokenizer.add('=');
		tokenizer.add('%');
		tokenizer.add(':');
		tokenizer.add(',');
		tokenizer.add('?');
		tokenizer.add('<=');
		tokenizer.add('>=');
		tokenizer.add('<');
		tokenizer.add('>');
		tokenizer.add('.');
		tokenizer.add('-');
		tokenizer.add('+');
		tokenizer.add('*');
		tokenizer.add('/');
		tokenizer.add('\\');
		tokenizer.add('(');
		tokenizer.add(')');
		tokenizer.add('[');
		tokenizer.add(']');
	}
	return tokenizer.tokenize(input, baseURI);
}

function escapeStringLiteral(string) {
	// var string = string.slice(1, -1);
	return string.replace(stringEscapeRegExp, function(str, match) {
		switch (match[0]) {
			// line continuation
			case '\n': return '';
			// null character
			case '0': return String.fromCharCode(0);
			// backspace
			case 'b': return String.fromCharCode(8);
			// form feed
			case 'f': return String.fromCharCode(12);
			// new line
			case 'n': return String.fromCharCode(10);
			// carriage return
			case 'r': return String.fromCharCode(13);
			// horizontal tab
			case 't': return String.fromCharCode(9);
			// vertical tab
			case 'v': return String.fromCharCode(11);
			// hexadecimal sequence (2 digits: dd)
			case 'x': return String.fromCharCode(parseInt(match.substr(1), 16));
			// unicode sequence (4 hex digits: dddd)
			case 'u': return String.fromCharCode(parseInt(match.substr(1), 16));
			// by default return escaped character "as is"
			default: return match;
		}
	});
}

function ParenthesizedExpression(ctx) {
	var result = Expression(ctx);
	if (!ctx.next(')')) ctx.error(')');
	return result;
}

function StringLiteral(ctx) {
	var fragment, result = '', start = ctx.next().value;
	for (ctx = ctx.setIgnored(); fragment = ctx.next();) {
		if (fragment === ctx.$EOF)
			ctx.error('unterminated string literal');
		if ((fragment = fragment.value) === start)
			return escapeStringLiteral(result);
		else if (fragment === '\\')
			result += '\\' + ctx.next().value;
		else result += fragment;
	}
}

function RegexpLiteral(ctx) {

	var result = '',
		inCharSet = false,
		flagNum = 0, flagStr;

	for (;;) {
		if (ctx.test(ctx.$EOF)) break;
		if (ctx.test(ctx.EOL)) break;
		if (!inCharSet && ctx.test('/')) break;
		if (ctx.next('\\')) result += '\\';
		else if (ctx.test('[')) inCharSet = true;
		else if (ctx.test(']')) inCharSet = false;
		result += ctx.next().value;
	}

	if (!ctx.next('/')) ctx.error('/');

	try { new RegExp(result) }
	catch (exception) { ctx.error(exception); }

	if (flagStr = ctx.next(ctx.PROP)) {
		flagStr = flagStr.value;
		if (!validRegexpFlags.test(flagStr)) ctx.error('g|i|m', flagStr);
		if (flagStr.indexOf('g') !== -1) flagNum |= Constants.RE_GLOBAL;
		if (flagStr.indexOf('m') !== -1) flagNum |= Constants.RE_MULTILINE;
		if (flagStr.indexOf('i') !== -1) flagNum |= Constants.RE_IGNORECASE;
	}

	return [Constants.AST_REGEXP, result, flagNum];
}

function PrimaryExpression(ctx) {
	return (
		ctx.next('null') ? null :
		ctx.next('true') ? true :
		ctx.next('false') ? false :
		ctx.next('/') ? RegexpLiteral(ctx) :
		ctx.next('{{%') ? LiteralStatement(ctx) :
		ctx.test(["'", '"']) ? StringLiteral(ctx) :
		ctx.next('[') ? ArrayExpression(ctx) :
		ctx.next('{{') ? NodesStatement(ctx, true) :
		ctx.next('this') ? Constants.AST_THIS :
		ctx.next('global') ? Constants.AST_GLOBAL :
		ctx.test(ctx.INT) ? parseInt(ctx.next().value, 10) :
		ctx.test(ctx.HEX) ? parseInt(ctx.next().value.slice(2), 16) :
		ctx.test(ctx.FLOAT) ? parseFloat(ctx.next().value) :
		ctx.test(ctx.REF) ? [Constants.AST_REF, ctx.next().value] :
		ctx.next('(') ? ParenthesizedExpression(ctx) :
		ctx.error('EXPRESSION')
	);
}

function MemberExpression(ctx) {
	var result = PrimaryExpression(ctx);

	for (;;) if (ctx.next('.')) {
		result = [Constants.AST_PROP, result];
		if (!ctx.test(ctx.PROP)) ctx.error('PROP');
		result.push(ctx.next().value);
	}

	else if (ctx.next('->')) {
		result = [Constants.AST_METHOD, result];
		if (!ctx.test(ctx.PROP)) ctx.error('PROP');
		result.push(ctx.next().value);
	}

	else if (ctx.next('[')) {
		result = [Constants.AST_PROP, result];
		result.push(Expression(ctx));
		if (!ctx.next(']')) ctx.error(']');
	}

	else if (ctx.next('(')) {
		result = [Constants.AST_CALL, result];
		if (ctx.next(')')) continue;
		do result.push(Expression(ctx));
		while (ctx.next(','));
		if (!ctx.next(')')) ctx.error(')');
	}

	else return result;
}

function UnaryExpression(ctx) {
	return (
		ctx.next('!') ? [Constants.AST_NOT, UnaryExpression(ctx)] :
		ctx.next('-') ? [Constants.AST_USUB, UnaryExpression(ctx)] :
		MemberExpression(ctx)
	);
}

function MultiplicativeExpression(ctx) {
	for (var result = UnaryExpression(ctx);
		ctx.next('*') && (result = [Constants.AST_MUL, result]) ||
		ctx.next('/') && (result = [Constants.AST_DIV, result]) ||
		ctx.next('%') && (result = [Constants.AST_MOD, result]);
		result.push(UnaryExpression(ctx)));
	return result;
}

function AdditiveExpression(ctx) {
	for (var result = MultiplicativeExpression(ctx);
		ctx.next('+') && (result = [Constants.AST_ADD, result]) ||
		ctx.next('-') && (result = [Constants.AST_SUB, result]);
		result.push(MultiplicativeExpression(ctx)));
	return result;
}

function RelationalExpression(ctx) {
	for (var result = AdditiveExpression(ctx);
		ctx.next('<=') && (result = [Constants.AST_LE, result]) ||
		ctx.next('>=') && (result = [Constants.AST_GE, result]) ||
		ctx.next('<') && (result = [Constants.AST_LT, result]) ||
		ctx.next('>') && (result = [Constants.AST_GT, result]);
		result.push(AdditiveExpression(ctx)));
	return result;
}

function EqualityExpression(ctx) {
	for (var result = RelationalExpression(ctx);
		ctx.next('=') && (result = [Constants.AST_EQ, result]) ||
		ctx.next('!=') && (result = [Constants.AST_NEQ, result]);
		result.push(RelationalExpression(ctx)));
	return result;
}

function LogicalANDExpression(ctx) {
	for (var result = EqualityExpression(ctx);
		ctx.next('&&') && (result = [Constants.AST_AND, result]);
		result.push(EqualityExpression(ctx)));
	return result;
}

function LogicalORExpression(ctx) {
	for (var result = LogicalANDExpression(ctx);
		ctx.next('||') && (result = [Constants.AST_OR, result]);
		result.push(LogicalANDExpression(ctx)));
	return result;
}

function Expression(ctx) {
	for (var result = LogicalORExpression(ctx);
		ctx.next('?') && (result = [Constants.AST_TERNARY, result, Expression(ctx)]);
		ctx.next(':') && result.push(Expression(ctx)));
	return result;
}

function ExpressionStatement(ctx) {
	if (ctx.next('}}')) return [T_NOP];
	var expression = Expression(ctx);
	if (!ctx.next('}}')) ctx.error('}}');
	return expression;
}

function VarStatement(ctx) {

	var name, result = [T_ARRAY];

	if (!ctx.test(ctx.VAR, '=')) {
		name = ctx.next(ctx.VAR);
		if (!name) ctx.error('identifier');
		if (!ctx.next('}}')) ctx.error('}}');
		result = [Constants.AST_VAR, NodesStatement(ctx), name.value];
		if (!ctx.next('/', 'var')) ctx.error('{{/var}}');
	}

	else do {
		name = ctx.next(ctx.VAR);
		if (!name) ctx.error('identifier');
		if (!ctx.next('=')) ctx.error('=');
		result.push([Constants.AST_VAR, Expression(ctx), name.value]);
		if (!ctx.next(',')) break;
	} while (!ctx.test(ctx.$EOF));

	if (!ctx.next('}}')) ctx.error('}}');

	return result;
}

function TemplateStatement(ctx) {
	return (ctx = ctx.setIgnored(ctx.SPACES)), (
		ctx.next('if') ? IfStatement(ctx) :
		ctx.next('for') ? ForStatement(ctx) :
		ctx.next('var') ? VarStatement(ctx) :
		ctx.next('macro') ? MacroStatement(ctx) :
		ctx.next('return') ? ReturnStatement(ctx) :
		ctx.test('/', ctx.STATEMENT, '}}') ? [T_BREAK] :
		ctx.test(ctx.STATEMENT) ? [T_BREAK] :
		ExpressionStatement(ctx)
	);
}

function LiteralStatement(ctx) {
	var result = '', ctx = ctx.setIgnored();
	while (!ctx.test([ctx.$EOF, '%}}']))
		result += ctx.next().value;
	if (!ctx.next('%}}')) ctx.error('%}}');
	return result;
}

function CommentStatement(ctx) {
	while (!ctx.test([ctx.$EOF, '*}}'])) ctx.next();
	if (!ctx.next('*}}')) ctx.error('*}}');
	return [T_NOP];
}

function Statement(ctx) {
	if (ctx.next('{{')) return TemplateStatement(ctx);
	if (ctx.next('{{%')) return LiteralStatement(ctx);
	if (ctx.next('{{*')) return CommentStatement(ctx);
	if (!ctx.test(ctx.$EOF)) return ctx.next().value;
	return [T_BREAK];
}

function NodesStatement(ctx, nested) {

	var node, type, hasReturn = false,
		result = [Constants.AST_NODES];

	for (ctx = ctx.setIgnored();;) {
		if (nested && ctx.test('}}')) break;
		node = Statement(ctx);
		type = (node instanceof Array ? node[0] : null);
		if (type === T_BREAK) break;
		if (!hasReturn && type !== T_NOP) {
			if (type === Constants.AST_RETURN) hasReturn = true;
			if (type !== T_ARRAY) result.push(node);
			else Array.prototype.push.apply(result, node.slice(1));
		}
	}

	if (nested && !ctx.next('}}')) ctx.error('}}');
	if (hasReturn) removeOutputNodes(result);
	return result;

}

function Parser(input, baseURI) {
	var ctx = tokenize(input, baseURI),
		result = NodesStatement(ctx);
	if (!ctx.next(ctx.$EOF)) ctx.error('EOF');
	return result;
}

module.exports = Parser;