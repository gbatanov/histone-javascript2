var RESOURCE_LOADER = null;

function loadResource(resourceURI, ret) {
	if (typeof RESOURCE_LOADER !== 'function') ret();
	else RESOURCE_LOADER(resourceURI, ret);
}

function setResourceLoader(resourceLoader) {
	if (typeof resourceLoader !== 'function') return;
	RESOURCE_LOADER = resourceLoader;
}

module.exports = {
	loadResource: loadResource,
	setResourceLoader: setResourceLoader
};