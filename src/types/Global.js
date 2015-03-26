var RTTI = require('../RTTI.js'),
	Runtime = require('../Runtime.js'),
	Utils = require('../Utils.js');

var RESOURCE_CACHE = {};

RTTI.register(RTTI.T_GLOBAL, 'toString', '(Global)');

RTTI.register(RTTI.T_GLOBAL, 'getBaseURI', function(self, args, scope) {
	return scope.getBaseURI();
});

RTTI.register(RTTI.T_GLOBAL, 'resolveURI', function(self, args, scope) {
	var relURI = args[0];
	if (typeof relURI !== 'string') return;
	var baseURI = (args.length > 1 ? args[1] : scope.getBaseURI());
	if (typeof baseURI !== 'string') return;
	var absURI = Utils.resolveURI(relURI, baseURI);
	return (typeof absURI === 'string' ? absURI : undefined);
});

RTTI.register(RTTI.T_GLOBAL, 'getUniqueId', function(self) {
	return ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = (c === 'x' ? r : r & 0x3 | 0x8);
		return v.toString(16);
	});
});

RTTI.register(RTTI.T_GLOBAL, 'getRand', function(self, args) {
	var min = Utils.toInt(args[0]), max = Utils.toInt(args[1]);
	if (typeof min !== 'number') min = 0;
	if (typeof max !== 'number') max = Math.pow(2, 32) - 1;
	if (min > max) { min = [max, max = min][0]; }
	return Math.floor(Math.random() * (max - min + 1)) + min;
});

/* @TODO, DEFAULT request params + content-type header */
RTTI.register(RTTI.T_GLOBAL, 'loadText', function(self, args, scope, ret) {
	var requestURI = args[0];
	if (typeof requestURI !== 'string') return ret();
	requestURI = Utils.resolveURI(requestURI, scope.getBaseURI());
	if (typeof requestURI !== 'string') return ret();
	var cacheKey = JSON.stringify(['loadText', requestURI]);
	if (RESOURCE_CACHE.hasOwnProperty(cacheKey))
		return ret(RESOURCE_CACHE[cacheKey]);
	RTTI.loadResource(requestURI, function(result) {
		result = (typeof result === 'string' ? result : undefined);
		ret(RESOURCE_CACHE[cacheKey] = result);
	});
});

RTTI.register(RTTI.T_GLOBAL, 'loadJSON', function(self, args, scope, ret) {
	var requestURI = args[0];
	if (typeof requestURI !== 'string') return ret();
	requestURI = Utils.resolveURI(requestURI, scope.getBaseURI());
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
});

RTTI.register(RTTI.T_GLOBAL, 'require', function(self, args, scope, ret) {
	var requestURI = args[0];
	if (typeof requestURI !== 'string') return ret();
	requestURI = Utils.resolveURI(requestURI, scope.getBaseURI());
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

	RTTI.loadResource(requestURI, function(template) {
		template = Runtime.parseTemplate(template, requestURI);
		var runtime = new Runtime(requestURI, thisObj)
		runtime.process(template, ret);
	});

});