var RTTI = require('../RTTI.js'),
	Runtime = require('../Runtime.js'),
	Utils = require('../Utils.js'),
	Utils_toInt = Utils.toInt,
	Utils_resolveURI = Utils.resolveURI;

var RESOURCE_CACHE = {};
var WEEK_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
var WEEK_DAYS_LONG = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
var MONTH_NAMES_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
var MONTH_NAMES_LONG = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];


RTTI.register(RTTI.T_GLOBAL, 'toString', '(Global)');

RTTI.register(RTTI.T_GLOBAL, 'getBaseURI', function(self, args, scope) {
	return scope.getBaseURI();
});

RTTI.register(RTTI.T_GLOBAL, 'resolveURI', function(self, args, scope) {
	var relURI = args[0];
	if (typeof relURI !== 'string') return;
	var baseURI = (args.length > 1 ? args[1] : scope.getBaseURI());
	if (typeof baseURI !== 'string') return;
	var absURI = Utils_resolveURI(relURI, baseURI);
	return (typeof absURI === 'string' ? absURI : undefined);
});

RTTI.register(RTTI.T_GLOBAL, 'getUniqueId', function(self) {
	return ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = (c === 'x' ? r : r & 0x3 | 0x8);
		return v.toString(16);
	});
});

RTTI.register(RTTI.T_GLOBAL, 'getWeekDayNameShort', function(self, args) {
	var day = Utils_toInt(args[0]);
	if (typeof day === 'number') return WEEK_DAYS_SHORT[--day];
});

RTTI.register(RTTI.T_GLOBAL, 'getWeekDayNameLong', function(self, args) {
	var day = Utils_toInt(args[0]);
	if (typeof day === 'number') return WEEK_DAYS_LONG[--day];
});

RTTI.register(RTTI.T_GLOBAL, 'getMonthNameShort', function(self, args) {
	var month = Utils_toInt(args[0]);
	if (typeof month === 'number') return MONTH_NAMES_SHORT[--month];
});

RTTI.register(RTTI.T_GLOBAL, 'getMonthNameLong', function(self, args) {
	var month = Utils_toInt(args[0]);
	if (typeof month === 'number') return MONTH_NAMES_LONG[--month];
});

RTTI.register(RTTI.T_GLOBAL, 'getDaysInMonth', function(self, args) {
	var year = Utils_toInt(args[0]), month = Utils_toInt(args[1]);
	if (typeof year === 'number' && year > 0 &&
		typeof month === 'number' && month > 0 && month < 13) {
		return (new Date(year, month, 0)).getDate();
	}
});

RTTI.register(RTTI.T_GLOBAL, 'getDayOfWeek', function(self, args) {
	var year = Utils_toInt(args[0]),
		month = Utils_toInt(args[1]),
		day = Utils_toInt(args[2]);
	if (typeof year === 'number' && year > 0 &&
		typeof month === 'number' && month > 0 && month < 13 &&
		typeof day === 'number' && day > 0 && day < 32) {
		var date = new Date(year, month -= 1, day);
		if (date.getFullYear() === year &&
			date.getMonth() === month &&
			date.getDate() === day) {
			return (date.getDay() || 7);
		}
	}
});

RTTI.register(RTTI.T_GLOBAL, 'getRand', function(self, args) {
	var min = Utils_toInt(args[0]), max = Utils_toInt(args[1]);
	if (typeof min !== 'number') min = 0;
	if (typeof max !== 'number') max = Math.pow(2, 32) - 1;
	if (min > max) { min = [max, max = min][0]; }
	return Math.floor(Math.random() * (max - min + 1)) + min;
});

/* @TODO, DEFAULT request params + content-type header */
RTTI.register(RTTI.T_GLOBAL, 'loadText', function(self, args, scope, ret) {
	var requestURI = args[0];
	if (typeof requestURI !== 'string') return ret();
	requestURI = Utils_resolveURI(requestURI, scope.getBaseURI());
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
	requestURI = Utils_resolveURI(requestURI, scope.getBaseURI());
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
	requestURI = Utils_resolveURI(requestURI, scope.getBaseURI());
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