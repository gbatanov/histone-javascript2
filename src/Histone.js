var Scope = require('./Scope.js');

function Histone() {

}

Histone.prototype.getAST = function() {

};

Histone.prototype.render = function() {

};

require('./rtti/Type.js');
require('./rtti/Undefined.js');
require('./rtti/Null.js');
require('./rtti/Boolean.js');
require('./rtti/Number.js');
require('./rtti/String.js');
require('./rtti/Array.js');
require('./rtti/RegExp.js');
require('./rtti/Macro.js');

module.exports = Histone;