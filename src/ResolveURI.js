var DOUBLE_SLASH = /\/\//g;
var TRAILING_FRAGMENT = /([^\/]*)$/;
var URL_PARSER_REGEXP = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?\#]*)(\?([^#]*))?(#(.*))?/;

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

module.exports = resolveURI;