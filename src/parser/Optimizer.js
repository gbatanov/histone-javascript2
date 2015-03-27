var Constants = require('../Constants.js');

function useVar(frames, name, value) {
	var frame = frames[frames.length - 1];
	if (!frame.hasOwnProperty(name)) frame[name] = [];
	frame[name].push(value);
}

function getUsedVars(node, frames, vars) {

	if (!vars) vars = [];
	if (!frames) frames = [{}];

	if (node instanceof Array) switch (node[0]) {

		case Constants.AST_REF: {
			var frame, name = node[1],
				index = frames.length;
			while (index--) {
				frame = frames[index];
				if (!frame.hasOwnProperty(name)) continue;
				frame = frame[name];
				vars.push(frame[frame.length - 1]);
				break;
			}
			break;
		}

		case Constants.AST_VAR: {
			// process value
			getUsedVars(node[1], frames, vars);
			// define variable
			useVar(frames, node[2], node);
			break;
		}

		case Constants.AST_MACRO: {
			// process default parameter values
			for (var c = 4; c < node.length; c++)
				getUsedVars(node[c][2], frames, vars);
			frames.push({});
			// define parameter names
			for (var c = 4; c < node.length; c++)
				useVar(frames, node[c][1], 0);
			// process body
			getUsedVars(node[2], frames, vars);
			frames.pop();
			// define macro
			useVar(frames, node[1], node);
			break;
		}

		case Constants.AST_FOR: {
			frames.push({});
			// define key & value
			if (node[1] !== null) useVar(frames, node[1], 0);
			if (node[2] !== null) useVar(frames, node[2], 0);
			// process body
			getUsedVars(node[3], frames, vars);
			frames.pop();
			// process all other nodes
			for (var c = 4; c < node.length; c++)
				getUsedVars(node[c], frames, vars);
			break;
		}

		case Constants.AST_NODES: {
			frames.push({});
			for (var c = 1; c < node.length; c++)
				getUsedVars(node[c], frames, vars);
			frames.pop();
			break;
		}

		default: for (var c = 0; c < node.length; c++) {
			getUsedVars(node[c], frames, vars);
		}

	}
	return vars;
}

function removeUnusedVars(nodes, usedVars) {

	var repeat = false;

	if (nodes instanceof Array) {
		var length = nodes.length;
		nodes.push(nodes.shift());
		while (--length) {
			var node = nodes.shift();
			switch (node instanceof Array ? node[0] : null) {

				case Constants.AST_VAR: {
					if (usedVars.indexOf(node) >= 0) {
						if (removeUnusedVars(node[1], usedVars))
							repeat = true;
						nodes.push(node);
					} else repeat = true;
					break;
				}

				case Constants.AST_MACRO: {
					if (usedVars.indexOf(node) >= 0) {
						for (var c = 4; c < node.length; c++) {
							if (removeUnusedVars(node[c][2], usedVars)) {
								repeat = true;
							}
						}
						if (removeUnusedVars(node[2], usedVars))
							repeat = true;
						nodes.push(node);
					} else repeat = true;
					break;
				}

				default: {
					if (removeUnusedVars(node, usedVars))
						repeat = true;
					nodes.push(node);
				}

			}
		}
	}
	return repeat;
}

function mergeStrings(nodes) {
	if (nodes instanceof Array) {
		if (nodes[0] === Constants.AST_NODES ||
			nodes[0] === Constants.AST_NODELIST) {

			var index = 0, length = nodes.length;
			nodes.push(nodes.shift());

			while (--length) {
				var node = nodes.shift();
				switch (node instanceof Array ? node[0] : null) {

					case Constants.AST_VAR: {
						if (index) index++;
						mergeStrings(node[1]);
						nodes.push(node);
						break;
					}

					case Constants.AST_MACRO: {
						if (index) index++;
						for (var c = 4; c < node.length; c++)
							mergeStrings(node[c][2]);
						mergeStrings(node[2]);
						nodes.push(node);
						break;
					}

					default: if (typeof node === 'string') {
						if (index) nodes[nodes.length - index] += node;
						else index++, nodes.push(node);
					} else {
						index = 0;
						mergeStrings(node);
						nodes.push(node);
					}

				}
			}

		} else nodes.forEach(mergeStrings);
	}
}

module.exports = function(node) {
	while (removeUnusedVars(node, getUsedVars(node)));
	mergeStrings(node);
};