{{macro foo(a)}}
	{{self->toJSON}}
{{/macro}}

{{foo()}}

{{var ui = require('ui.tpl')}}

{{ui.inputText()}}