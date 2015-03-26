// used to escape strings to use within regexp
var REGEXP_ESCAPE = /([.?*+^$[\]\\(){}|-])/g;

function escapeExpression(expression) {
	if (expression instanceof RegExp) {
		expression = expression.toString();
		expression = expression.slice(1, -1);
	} else expression = expression.replace(REGEXP_ESCAPE, '\\$1');
	return '(' + expression + ')';
}

function TokenSet() {
	this.names = [];
	this.exprs = [];
}

TokenSet.prototype.add = function() {
	var name, expression,
		length = arguments.length
	if (!length) return;

	if (length > 1) {
		name = arguments[0];
		expression = arguments[1];
	} else expression = arguments[0];


	this.names.push(name);
	this.exprs.push(escapeExpression(expression));
};

TokenSet.prototype.tokenize = function(input) {
	return new Tokenizer(
		input, this.names,
		new RegExp(this.exprs.join('|'), 'g')
	);
};


var T_EOF = -1;
var T_ERROR = -2;
var T_TOKEN = -3;

function compareToken(token, selector) {

	var selector = [].concat(selector),
		type = token.type, value = token.value;

	for (var c = 0; c < selector.length; c++) {
		var fragment = selector[c];

		if (typeof fragment === 'number') {
			if (type instanceof Array) {
				if (type.indexOf(fragment) >= 0)
					return true;
			} else if (fragment === type) return true;
		}

		else if (typeof fragment === 'string') {
			if (fragment === value) return true;
		}

	}
}

function Tokenizer(input, names, regexp) {

	this.inputStr = input;
	this.inputLen = input.length;
	this.regexp = regexp;

	this.buffer = [];
	this.tokenIds = [];
	this.ignoredTokens = null;

	var c, name, lastTokenId = 1,
		tokenIds = this.tokenIds;

	for (i = 0; i < names.length; i++) {

		name = names[i];

		if (typeof name !== 'undefined') {

			if (name instanceof Array) {
				name = [].concat(name)
				for (var j = 0; j < name.length; j++) {
					if (!this.hasOwnProperty(name[j]))
						this[name[j]] = (++lastTokenId);
					name[j] = this[name[j]];
				}
			} else {
				if (!this.hasOwnProperty(name))
					this[name] = (++lastTokenId);
				name = this[name];
			}


			tokenIds.push(name);


		} else tokenIds.push(T_TOKEN);
	}


}

Tokenizer.prototype.$EOF = T_EOF;

Tokenizer.prototype.setIgnored = function() {
	var ignoredTokens = Array.prototype.slice.call(arguments);
	if (!ignoredTokens.length) ignoredTokens = null;
	if (this.ignoredTokens === ignoredTokens) return this;
	function Tokenizer() { this.ignoredTokens = ignoredTokens; }
	Tokenizer.prototype = this;
	return new Tokenizer();
};

// match next token and put it into the tokenBuffer
Tokenizer.prototype.readTokenToBuffer = function() {

	var matchObj, matchStr,


		buffer = this.buffer,
		regexp = this.regexp,
		startPos = regexp.lastIndex,
		checkIndex = this.inputLen;

	if (startPos < checkIndex) {
		if (matchObj = regexp.exec(matchStr = this.inputStr)) {

			// check if we have T_ERROR token
			if (startPos < (checkIndex = matchObj.index)) {
				buffer.push({
					type: T_ERROR, pos: startPos,
					value: matchStr.slice(startPos, checkIndex)
				});
			}

			while (matchObj.pop() === undefined);

			buffer.push({
				type: this.tokenIds[matchObj.length - 1],
				pos: checkIndex,
				value: matchObj[0]
			});

		}

		// return T_ERROR token in case if we couldn't match anything
		else (regexp.lastIndex = checkIndex, buffer.push({
			type: T_ERROR, pos: startPos,
			value: this.inputStr.slice(startPos)
		}));

	}

	// return T_EOF if we reached end of file
	else buffer.push({type: T_EOF, pos: checkIndex});
};

Tokenizer.prototype.getTokenFromBuffer = function(offset) {
	var buffer = this.buffer, toRead = offset - buffer.length + 1;
	while (toRead-- > 0) this.readTokenToBuffer();

	var token = buffer[offset];
	if (this.ignoredTokens && compareToken(token, this.ignoredTokens)) {

		return {
			type: token.type,
			pos: token.pos,
			value: token.value,
			ignored: true
		};

	} else return token;
};

Tokenizer.prototype.getTokenA = function(consume) {
	var token, offset = 0, buffer = this.buffer;
	if (consume) while (
		token = this.getTokenFromBuffer(0),
		buffer.shift(), token.ignored
	); else while (
		token = this.getTokenFromBuffer(offset++),
		token.ignored
	);
	return token;
};

Tokenizer.prototype.getTokenB = function(selector, consume) {

	// console.info(selector, consume)

	var token, length = selector.length,
		index = 0, start = 0, end = 0;

	for (;;) {

		token = this.getTokenFromBuffer(end++);

		if (compareToken(token, selector[index])) {
			if (++index >= length) break;
		}

		else if (token.ignored) start++;

		else return;

	}

	if (!consume) return true;

	var buffer = this.buffer;

	for (token = [], index = 0; index < end; index++) {
		if (index < start) buffer.shift();
		else token.push(buffer.shift());
	}

	if (token.length === 1) token = token[0];

	return token;

};

Tokenizer.prototype.next = function() {
	return (
		arguments.length ?
		this.getTokenB(arguments, true) :
		this.getTokenA(true)
	);
};

Tokenizer.prototype.test = function() {
	return (
		arguments.length ?
		this.getTokenB(arguments, false) :
		this.getTokenA(false)
	);
};

Tokenizer.prototype.error = function(expected) {
	// dump(this.buffer);
	throw ('SYNTAX ERROR: expected ' + expected);
};

module.exports = TokenSet;