var RTTI = require('../RTTI'),
	Utils = require('../Utils'),
	Network = require('../Network'),
	Parser = require('../parser/Parser'),
	Processor = require('../Processor'),

	RTTI_register = RTTI.register,
	RTTI_T_GLOBAL = RTTI.T_GLOBAL,
	Utils_toInt = Utils.toInt,
	Utils_resolveURI = Utils.resolveURI;

var WEEK_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
var WEEK_DAYS_LONG = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
var MONTH_NAMES_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
var MONTH_NAMES_LONG = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];


var RESOURCE_CACHE = {};

function getCache(cacheKey, load, process) {
	if (cacheKey) cacheKey = JSON.stringify(cacheKey);
	if (!cacheKey || !RESOURCE_CACHE.hasOwnProperty(cacheKey)) {
		load(function(result) {
			if (cacheKey) RESOURCE_CACHE[cacheKey] = result;
			process(result);
		});
	} else process(RESOURCE_CACHE[cacheKey]);
}

RTTI_register(RTTI_T_GLOBAL, 'toString', '(Global)');

RTTI_register(RTTI_T_GLOBAL, 'getBaseURI', function(self, args, scope) {
	return scope.getBaseURI();
});

RTTI_register(RTTI_T_GLOBAL, 'resolveURI', function(self, args, scope) {
	var relURI = args[0];
	if (typeof relURI !== 'string') return;
	var baseURI = (args.length > 1 ? args[1] : scope.getBaseURI());
	if (typeof baseURI !== 'string') return;
	var absURI = Utils_resolveURI(relURI, baseURI);
	return (typeof absURI === 'string' ? absURI : undefined);
});

RTTI_register(RTTI_T_GLOBAL, 'getUniqueId', function(self) {
	return ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = (c === 'x' ? r : r & 0x3 | 0x8);
		return v.toString(16);
	});
});

RTTI_register(RTTI_T_GLOBAL, 'getWeekDayNameShort', function(self, args) {
	var day = Utils_toInt(args[0]);
	if (typeof day === 'number') return WEEK_DAYS_SHORT[--day];
});

RTTI_register(RTTI_T_GLOBAL, 'getWeekDayNameLong', function(self, args) {
	var day = Utils_toInt(args[0]);
	if (typeof day === 'number') return WEEK_DAYS_LONG[--day];
});

RTTI_register(RTTI_T_GLOBAL, 'getMonthNameShort', function(self, args) {
	var month = Utils_toInt(args[0]);
	if (typeof month === 'number') return MONTH_NAMES_SHORT[--month];
});

RTTI_register(RTTI_T_GLOBAL, 'getMonthNameLong', function(self, args) {
	var month = Utils_toInt(args[0]);
	if (typeof month === 'number') return MONTH_NAMES_LONG[--month];
});

RTTI_register(RTTI_T_GLOBAL, 'getDaysInMonth', function(self, args) {
	var year = Utils_toInt(args[0]), month = Utils_toInt(args[1]);
	if (typeof year === 'number' && year > 0 &&
		typeof month === 'number' && month > 0 && month < 13) {
		return (new Date(year, month, 0)).getDate();
	}
});

RTTI_register(RTTI_T_GLOBAL, 'getDayOfWeek', function(self, args) {
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

RTTI_register(RTTI_T_GLOBAL, 'getRand', function(self, args) {
	var min = Utils_toInt(args[0]), max = Utils_toInt(args[1]);
	if (typeof min !== 'number') min = 0;
	if (typeof max !== 'number') max = Math.pow(2, 32) - 1;
	if (min > max) { min = [max, max = min][0]; }
	return Math.floor(Math.random() * (max - min + 1)) + min;
});

/* @TODO, DEFAULT request params + content-type header */
RTTI_register(RTTI_T_GLOBAL, 'loadText', function(self, args, scope, ret) {
	var requestURI = args[0];
	if (typeof requestURI !== 'string') return ret();
	requestURI = Utils_resolveURI(requestURI, scope.getBaseURI());
	if (typeof requestURI !== 'string') return ret();
	getCache(['loadText', requestURI], function(ret) {
		Network.loadResource(requestURI, function(result) {
			ret(typeof result === 'string' ? result : undefined);
		});
	}, ret);
});

RTTI_register(RTTI_T_GLOBAL, 'loadJSON', function(self, args, scope, ret) {
	var requestURI = args[0];
	if (typeof requestURI !== 'string') return ret();
	requestURI = Utils_resolveURI(requestURI, scope.getBaseURI());
	if (typeof requestURI !== 'string') return ret();
	getCache(['loadJSON', requestURI], function(ret) {
		Network.loadResource(requestURI, function(result) {
			if (typeof result === 'string') try {
				result = result.replace(/^\s*([$A-Z_][0-9A-Z_$]*)?\s*\(\s*/i, '');
				result = result.replace(/\s*\)\s*(;\s*)*\s*$/, '');
				ret(JSON.parse(result));
			} catch (exception) {}
			ret();
		});
	}, ret);
});

RTTI_register(RTTI_T_GLOBAL, 'require', function(self, args, scope, ret) {
	var requestURI = args[0];
	if (typeof requestURI !== 'string') return ret();
	requestURI = Utils_resolveURI(requestURI, scope.getBaseURI());
	if (typeof requestURI !== 'string') return ret();
	getCache(args.length === 1 && ['templateResult', requestURI], function(ret) {
		getCache(['templateAST', requestURI], function(ret) {
			Network.loadResource(requestURI, function(template) {
				if (typeof template !== 'string') template = undefined;
				else template = Parser(template, requestURI);
				ret(template);
			});
		}, function(templateAST) {
			if (typeof templateAST === 'undefined') return ret();
			var processor = new Processor(requestURI, args[1]);
			processor.process(templateAST, ret);
		});
	}, ret);
});