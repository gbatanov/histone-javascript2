var Parser = require('./src/parser/Parser.js');


var template = Parser('{{var x = 30, y = 900}}');
console.info(template);