{{macro foo}}
	{{self->toJSON}}
{{/macro}}

{{[

	foo: 'bar',
	x: 'y'

]->toJSON}}

{{macro inputText}}
	HELLO = {{self.arguments->toJSON}}
{{/macro}}

{{var inputText = inputText->extend([
	EMAIL: 'EMAIL',
	TEXT: 'TEXT',
	PASSWORD: 'PASSWORD'
])}}

{{var inputText = inputText->extend([
	FOO: 'bar'
])}}

{{var inputText = inputText->bind(1, 2, 3)}}

{{inputText.FOO}}

{{macro replacer(a)}}
	{{return '[' + a + ']'}}
{{/macro}}

{{var ui = require('ui.tpl')}}
-{{ui.inputText->isMacro}}-

-{{'FOOabcsTrInGs'->replace(/[A-Z]+/g, replacer)}}-
{{getRand(-300)}}