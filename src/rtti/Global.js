var RTTI = require('../RTTI.js');
var Scope = require('../Scope.js');
var Processor = require('../Processor.js');

var RESOURCE_CACHE = {};


RTTI.register('HistoneGlobal', 'toString', '(Global)');

RTTI.register('HistoneGlobal', 'getBaseURI', function(self, args, scope) {
	return scope.getBaseURI();
});

RTTI.register('HistoneGlobal', 'loadText', function(self, args, scope, ret) {
	var requestURI = args[0];
	if (typeof requestURI !== 'string') return ret();
	requestURI = RTTI.resolveURI(requestURI, scope.getBaseURI());
	if (typeof requestURI !== 'string') return ret();
	var cacheKey = JSON.stringify(['loadText', requestURI]);
	if (RESOURCE_CACHE.hasOwnProperty(cacheKey))
		return ret(RESOURCE_CACHE[cacheKey]);
	RTTI.loadResource(requestURI, function(result) {
		result = (typeof result === 'string' ? result : undefined);
		ret(RESOURCE_CACHE[cacheKey] = result);
	});
}, true);

RTTI.register('HistoneGlobal', 'loadJSON', function(self, args, scope, ret) {
	var requestURI = args[0];
	if (typeof requestURI !== 'string') return ret();
	requestURI = RTTI.resolveURI(requestURI, scope.getBaseURI());
	if (typeof requestURI !== 'string') return ret();
	var cacheKey = JSON.stringify(['loadText', requestURI]);
	if (RESOURCE_CACHE.hasOwnProperty(cacheKey))
		return ret(RESOURCE_CACHE[cacheKey]);
	RTTI.loadResource(requestURI, function(result) {
		if (typeof result === 'string') try {
			result = result.replace(/^\s*([$A-Z_][0-9A-Z_$]*)?\s*\(\s*/i, '');
			result = result.replace(/\s*\)\s*(;\s*)*\s*$/, '');
			ret(RESOURCE_CACHE[cacheKey] = JSON.parse(result));
		} catch (exception) {}
		ret(RESOURCE_CACHE[cacheKey] = undefined);
	});
}, true);

RTTI.register('HistoneGlobal', 'require', function(self, args, scope, ret) {
	var requestURI = args[0];
	if (typeof requestURI !== 'string') return ret();
	requestURI = RTTI.resolveURI(requestURI, scope.getBaseURI());
	if (typeof requestURI !== 'string') return ret();

	var resultCache, thisObj = (args.length > 1 ? args[1] : undefined);

	if (thisObj === undefined) {
		resultCache = JSON.stringify(['require', requestURI]);
		if (RESOURCE_CACHE.hasOwnProperty(resultCache)) {
			return ret(RESOURCE_CACHE[resultCache]);
		}
	}

	var template = JSON.stringify(['template', requestURI]);
	if (!RESOURCE_CACHE.hasOwnProperty(template)) {

		// $tpl = Histone::loadResource($requestURI, array('method' => 'GET'));
		// if (is_string($tpl)) $tpl = Histone::parse($tpl, $requestURI);
		// $template = Histone_Global::setCache($template, $tpl);

	} else template = RESOURCE_CACHE[template];

	RTTI.loadResource(requestURI, function(resource) {
		resource = RTTI.parse(resource, requestURI);
		var scope = new Scope(requestURI, 'thisObj');
		Processor(resource, scope, ret);
	});

}, true);