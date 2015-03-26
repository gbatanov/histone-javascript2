var Tokenizer = require('./Tokenizer.js');
var Constants = require('../Constants.js');
var Optimize = require('./Optimizer.js');

const T_NOP = -1;
const T_BREAK = -2;
const T_ARRAY = -3;

var tokenizer;
// used to validate regular expression flags
var validRegexpFlags = /^(?:([gim])(?!.*\1))*$/;
// used to convert control characters into regular characters
var stringEscapeRegExp = /\\(x[0-9A-F]{2}|u[0-9A-F]{4}|\n|.)/g;

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

function tokenize(input, baseURI) {
	if (!tokenizer) {
		tokenizer = new Tokenizer();
		tokenizer.add('PROP', /null\b/);
		tokenizer.add('PROP', /true\b/);
		tokenizer.add('PROP', /false\b/);
		tokenizer.add(['PROP', 'STATEMENT'], /if\b/);
		tokenizer.add(['PROP', 'STATEMENT'], /in\b/);
		tokenizer.add(['PROP', 'STATEMENT'], /for\b/);
		tokenizer.add(['PROP', 'STATEMENT'], /var\b/);
		tokenizer.add(['PROP', 'STATEMENT'], /else\b/);
		tokenizer.add(['PROP', 'STATEMENT'], /macro\b/);
		tokenizer.add(['PROP', 'STATEMENT'], /elseif\b/);
		tokenizer.add(['PROP', 'STATEMENT'], /return\b/);
		tokenizer.add('HEX', /0[xX][0-9A-Fa-f]+/);
		tokenizer.add('FLOAT', /(?:[0-9]*\.)?[0-9]+[eE][+-]?[0-9]+/);
		tokenizer.add('FLOAT', /[0-9]*\.[0-9]+/);
		tokenizer.add('INT', /[0-9]+/);
		tokenizer.add(['PROP', 'REF'], /this\b/);
		tokenizer.add(['PROP', 'REF'], /self\b/);
		tokenizer.add(['PROP', 'REF'], /global\b/);
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

function ArrayExpression(ctx) {
	var key, values = {}, result = [Constants.AST_ARRAY];
	do {
		while (ctx.next(','));
		if (ctx.next(']')) return result;

		if (key = ctx.next(ctx.PROP, ':')) {
			if (!values.hasOwnProperty(key = key[0].value)) {
				values[key] = result.length;
				result.push([Constants.AST_NOP, Expression(ctx), key]);
			} else result[values[key]][1] = Expression(ctx);
		}

		else if (key = Expression(ctx), (
			typeof key === 'string' ||
			typeof key === 'number'
		) && ctx.next(':')) {

			if (!values.hasOwnProperty(key = String(key))) {
				values[key] = result.length;
				result.push([Constants.AST_NOP, Expression(ctx), key]);
			} else result[values[key]][1] = Expression(ctx);

		}

		else result.push([Constants.AST_NOP, key]);

	} while (ctx.next(','));
	if (!ctx.next(']')) ctx.error(']');
	return result;
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

function ParenthesizedExpression(ctx) {
	var result = Expression(ctx);
	if (!ctx.next(')')) ctx.error(')');
	return result;
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
		ctx.next('this') ? [Constants.AST_THIS] :
		ctx.next('global') ? [Constants.AST_GLOBAL] :
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

function IfStatement(ctx) {
	var condition, result = [Constants.AST_IF];
	do {
		condition = Expression(ctx);
		if (!ctx.next('}}')) ctx.error('}}');
		result.push(NodesStatement(ctx), condition);
	} while (ctx.next('elseif'));

	if (ctx.next('else')) {
		if (!ctx.next('}}')) ctx.error('}}');
		result.push(NodesStatement(ctx))
	}
	if (!ctx.next('/', 'if', '}}')) ctx.error('{{/if}}');
	return result;
}

function VarStatement(ctx) {
	var name, result = [T_ARRAY];
	if (!ctx.test(ctx.VAR, '=')) {
		name = ctx.next(ctx.VAR);
		if (!name) ctx.error('identifier');
		if (!ctx.next('}}')) ctx.error('}}');
		result = [Constants.AST_VAR, NodesStatement(ctx), name.value];
		if (!ctx.next('/', 'var')) ctx.error('{{/var}}');
	} else do {
		name = ctx.next(ctx.VAR);
		if (!name) ctx.error('identifier');
		if (!ctx.next('=')) ctx.error('=');
		result.push([Constants.AST_VAR, Expression(ctx), name.value]);
		if (!ctx.next(',')) break;
	} while (!ctx.test(ctx.$EOF));
	if (!ctx.next('}}')) ctx.error('}}');
	return result;
}

function ForStatement(ctx) {
	var expression, result = [Constants.AST_FOR];
	if (expression = ctx.next(ctx.VAR)) {
		expression = expression.value;
		if (ctx.next(':')) {
			result.push(expression);
			if (expression = ctx.next(ctx.VAR))
				result.push(expression.value);
			else ctx.error('identifier');
		} else result.push(null, expression);
	} else result.push(null, null);
	if (!ctx.next('in')) ctx.error('in');

	do {
		expression = Expression(ctx);
		if (!ctx.next('}}')) ctx.error('}}');
		result.push(NodeArray(ctx), expression);
	} while (ctx.next('elseif'));

	if (ctx.next('else')) {
		if (!ctx.next('}}')) ctx.error('}}');
		result.push(NodesStatement(ctx));
	}
	if (!ctx.next('/', 'for', '}}'))
		ctx.error('{{/for}}');
	return result;
}

function MacroStatement(ctx) {

	var params = [],
		result = [Constants.AST_MACRO],
		name = ctx.next(ctx.VAR);

	if (!name) ctx.error('identifier');
	result.push(name.value);

	if (ctx.next('(') && !ctx.next(')')) {
		do {
			name = ctx.next(ctx.VAR);
			if (!name) ctx.error('identifier');
			if (ctx.next('=')) params.push([
				Constants.AST_NOP,
				name.value,
				Expression(ctx)
			]); else params.push([
				Constants.AST_NOP,
				name.value
			]);
		} while (ctx.next(','));
		if (!ctx.next(')')) ctx.error(')');
	}

	if (!ctx.next('}}')) ctx.error('}}');

	result.push(NodeArray(ctx));

	if (!ctx.next('/', 'macro', '}}')) ctx.error('{{/macro}}');

	if (params.length) result = result.concat(params.length, params);
	return result;
}

function ReturnStatement(ctx) {
	var result = [Constants.AST_RETURN];
	if (ctx.next('}}')) {
		result.push(NodesStatement(ctx));
		if (!ctx.next('/', 'return')) ctx.error('{{/return}}');
	} else result.push(Expression(ctx));
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

function removeOutputNodes(nodes) {
	var c, node, length = nodes.length - 1;
	nodes.push(nodes.shift());
	while (length--) {
		node = nodes.shift();
		switch (node instanceof Array ? node[0] : null) {
			case Constants.AST_IF: {
				for (c = 1; c < node.length; c += 2)
					node[c] = removeOutputNodes(node[c]);
				nodes.push(node);
				break;
			}
			case Constants.AST_FOR: {
				for (c = 3; c < node.length; c += 2)
					node[c] = removeOutputNodes(node[c]);
				nodes.push(node);
				break;
			}
			case Constants.AST_VAR:
			case Constants.AST_MACRO:
			case Constants.AST_RETURN: {
				nodes.push(node);
				break;
			}
		}
	}
	return nodes;
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
	if (hasReturn) result = removeOutputNodes(result);
	return result;
}

function NodeArray(ctx) {
	var node, type, hasReturn = false,
		result = [Constants.AST_NODELIST];
	for (ctx = ctx.setIgnored();;) {
		node = Statement(ctx);
		type = (node instanceof Array ? node[0] : null);
		if (type === T_BREAK) break;
		if (!hasReturn && type !== T_NOP) {
			if (type === Constants.AST_RETURN) hasReturn = true;
			if (type !== T_ARRAY) result.push(node);
			else Array.prototype.push.apply(result, node.slice(1));
		}
	}
	if (hasReturn) result = removeOutputNodes(result);
	return result;
}





function getReference(name, scopeChain) {


	var scopeIndex = scopeChain.length;
	var currentScope = scopeIndex - 1;

	while (scopeIndex--) {
		var scope = scopeChain[scopeIndex];
		if (scope.hasOwnProperty(name)) return [
			Constants.AST_REF,
			currentScope - scopeIndex,
			scope[name]
		];
	}

	return [Constants.AST_METHOD, [Constants.AST_GLOBAL], name];

}

function setReference(name, scopeChain) {
	var lastScope = scopeChain[scopeChain.length - 1];
	if (!lastScope.hasOwnProperty(name))
		lastScope[name] = Object.keys(lastScope).length;
	return lastScope[name];
}

function array_key_exists(key, array) {
	return (typeof array[key] !== 'undefined');
}



function markReferences(node, scopeChain) {

	if (typeof scopeChain !== 'object') scopeChain = [{}];

	switch (node instanceof Array ? node[0] : null) {

		case Constants.AST_REF: {
			Array.prototype.splice.apply(node, [0, node.length].concat(
				getReference(node[1], scopeChain)
			));
			break;
		}

		case Constants.AST_VAR: {
			markReferences(node[1], scopeChain);
			node[2] = setReference(node[2], scopeChain);
			break;
		}

		case Constants.AST_FOR: {

			markReferences(node[4], scopeChain);

			scopeChain.push({});
			setReference('self', scopeChain);
			if (node[1] !== null) node[1] = setReference(node[1], scopeChain);
			if (node[2] !== null) node[2] = setReference(node[2], scopeChain);
			markReferences(node[3], scopeChain);
			scopeChain.pop();

			for (var c = 5; c < node.length; c += 2) {
				markReferences(node[c], scopeChain);
				if (!array_key_exists(c + 1, node)) break;
				markReferences(node[c + 1], scopeChain);
			}

			break;
		}

		case Constants.AST_MACRO: {


			for (var c = 4; c < node.length; ++c) {
				var param = node[c];
				if (!array_key_exists(2, param)) continue;
				markReferences(param[2], scopeChain);
			}


			node[1] = setReference(node[1], scopeChain);

			scopeChain.push({});
			setReference('self', scopeChain);

			if (array_key_exists(3, node)) {
				var paramList = [];
				for (var c = 4; c < node.length; c++) {
					var param = node[c];
					setReference(param[1], scopeChain);
					if (array_key_exists(2, param)) {
						paramList.push(c - 4);
						paramList.push(param[2]);
					}
				}
				Array.prototype.splice.apply(node, [4, node.length].concat(paramList));
			}

			markReferences(node[2], scopeChain);
			scopeChain.pop();
			break;
		}

		case Constants.AST_NODES: {
			scopeChain.push({});
			for (var c = 1; c < node.length; ++c)
				markReferences(node[c], scopeChain);
			scopeChain.pop();
			break;
		}

		default: if (node instanceof Array) {
			for (var c = 0; c < node.length; c++) {
				markReferences(node[c], scopeChain);
			}
		}


	}
}

function Parser(input, baseURI) {
	var ctx = tokenize(input, baseURI),
		result = NodeArray(ctx);
	if (!ctx.next(ctx.$EOF)) ctx.error('EOF');

	Optimize(result);

	markReferences(result);
	return result;
}

module.exports = Parser;