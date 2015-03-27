var DOUBLE_SLASH = /\/\//g;
var TRAILING_FRAGMENT = /([^\/]*)$/;
var URL_PARSER_REGEXP = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?\#]*)(\?([^#]*))?(#(.*))?/;

function isNumeric(value) {
	return (!isNaN(parseFloat(value)) && isFinite(value));
}

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

function loopAsync(iterator, ret) {

	var calls = 0, looping = false;

	var resume = function() {
		calls += 1;
		if (looping) return;
		looping = true;

		while (calls > 0) {
			calls -= 1;
			iterator(function(stop) {
				if (stop === true) ret();
				else resume();
			});
		}
		looping = false;
	};

	resume();

}


function toNumber(value) {

	if (typeof value === 'number') return value;

	if (typeof value === 'string') {
		value = parseFloat(value);
		if (!isNaN(value) && isFinite(value)) {
			return value;
		}
	}


}


function toInt(value) {

	value = toNumber(value);

	if (typeof value === 'number' && value % 1 === 0) {
		return value;
	}

}

function parseURI(uri) {
	var result = uri.match(URL_PARSER_REGEXP);
	return {
		scheme: result[1] ? result[2] : null,
		authority: result[3] ? result[4] : null,
		path: result[5],
		query: result[6] ? result[7] : null,
		fragment: result[8] ? result[9] : null
	};
}

function removeDotSegments(path) {

	if (path === '/') return '/';

	var up = 0, out = [],
		segments = path.split('/'),
		leadingSlash = (path[0] === '/' ? '/' : ''),
		trailingSlash = (path.slice(-1) === '/' ? '/' : '');

	segments.forEach(function(segment) {
		switch (segment) {
			case '': case '.': break;
			case '..': if (out.length) out.pop(); else up++; break;
			default: out.push(segment);
		}
	});

	if (!leadingSlash) {
		while (up--) out.unshift('..');
		if (!out.length) out.push('.');
	}

	return (leadingSlash + out.join('/') + trailingSlash);
}


function resolveURI(relURI, baseURI) {

	var absURI = '', absScheme,
		absAuthority, absPath,
		absQuery, absFragment,
		relURI = parseURI(relURI),
		baseURI = parseURI(baseURI),
		relScheme = relURI.scheme,
		relAuthority = relURI.authority,
		relPath = relURI.path,
		relQuery = relURI.query,
		relFragment = relURI.fragment,
		baseScheme = baseURI.scheme,
		baseAuthority = baseURI.authority,
		basePath = baseURI.path,
		baseQuery = baseURI.query;


	if (typeof relScheme === 'string') {
		absScheme = relScheme;
		absAuthority = relAuthority;
		absPath = relPath;
		absQuery = relQuery;
		absFragment = relFragment;
	}

	else if (typeof relAuthority === 'string') {
		absScheme = baseScheme;
		absAuthority = relAuthority;
		absPath = relPath;
		absQuery = relQuery;
		absFragment = relFragment;
	}

	else if (relPath === '') {
		absScheme = baseScheme;
		absAuthority = baseAuthority;
		absPath = basePath;
		absQuery = (typeof relQuery === 'string' ? relQuery : baseQuery);
		absFragment = relFragment;
	}

	else if (relPath[0] === '/') {
		absScheme = baseScheme;
		absAuthority = baseAuthority;
		absPath = relPath;
		absQuery = relQuery;
		absFragment = relFragment;
	}

	else if (typeof baseAuthority === 'string' && basePath === '') {
		absScheme = baseScheme;
		absAuthority = baseAuthority;
		absPath = ('/' + relPath);
		absQuery = relQuery;
		absFragment = relFragment;
	}

	else {
		absScheme = baseScheme;
		absAuthority = baseAuthority;
		absPath = basePath.replace(TRAILING_FRAGMENT, '') + relPath;
		absQuery = relQuery;
		absFragment = relFragment;

	}

	if (typeof absScheme === 'string') absURI += (absScheme.toLowerCase() + ':');
	if (typeof absAuthority === 'string') absURI += ('//' + absAuthority);
	absURI += removeDotSegments(absPath.replace(DOUBLE_SLASH, '/'));
	if (absQuery) absURI += ('?' + absQuery);
	if (absFragment) absURI += ('#' + absFragment);

	return absURI;
}


module.exports = {
	toInt: toInt,
	toNumber: toNumber,
	isNumeric: isNumeric,
	resolveURI: resolveURI,
	loopAsync: loopAsync,
	forEachAsync: forEachAsync
};