'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var Router = (function () {
	function Router() {
		_classCallCheck(this, Router);
	}

	_createClass(Router, null, [{
		key: 'MapRoute',

		// To be used as a decorator/annotation on class methods:
		value: function MapRoute() {
			var url = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];
			var method = arguments.length <= 1 || arguments[1] === undefined ? Router.GET : arguments[1];

			var routes = _http2['default'].routes;

			// Allow trailing slash to be optional:
			url = url.replace(/\/$/, '') || '/';

			// Don't allow rewriting of existing routes:
			if (url in routes) throw new Error(url + ' is already a route');

			// Return the real decorator:
			return function (controller, action, descriptor) {

				// Mapping a method:
				if (action) {
					routes[url] = { action: action, controller: controller, method: method };

					descriptor.value.controller = controller;
					return descriptor;
				}
				// Mapping a controller:
				else {
						var reRoutes = {};

						// Modify routes to include controller's url:
						for (var route in routes) {
							if (routes[route].controller === controller) {
								reRoutes[_path2['default'].join(url, route)] = routes[route];
							} else {
								reRoutes[route] = routes[route];
							}
						}

						_http2['default'].routes = reRoutes;

						return controller;
					}
			};
		}

		// Compare a URL to our collection of routes:
	}, {
		key: 'find',
		value: function find(url) {
			var routes = _http2['default'].routes;

			// Will hold the found route:
			var found = undefined;

			// The address query string:
			var query = url.split('?')[1];

			// Allow trailing slash to be optional:
			url = url.split('?')[0].replace(/\/$/, '') || '/';

			// Regex to find variables in route:
			var pattern = /\{(.*)\}/;

			// Loop through all routes to match against url:
			var _loop = function (_route) {

				// Allow trailing slash to be optional:
				_route = _route.replace(/\/$/, '') || '/';

				// Collection of discovered variables:
				var vars = {};

				// Route has no variables:
				if (_route === url) {
					found = routes[_route];
				}

				// Route contains variables:
				if (_route.match(pattern)) {

					// Route is compatable:
					if (_route.split('/').length === url.split('/').length) {

						// Keep track of the index:
						var i = 0;

						// split route on each dir, then loop:
						_iteratorNormalCompletion = true;
						_didIteratorError = false;
						_iteratorError = undefined;

						try {
							for (_iterator = _getIterator(_route.split('/')); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
								var dir = _step.value;

								if (dir.match(pattern)) {
									vars[dir.match(pattern)[1]] = url.split('/')[i++];
								} else if (dir === url.split('/')[i++]) {
									continue;
								} else {
									vars = {};
									break;
								}
							}

							// Found correct route:
						} catch (err) {
							_didIteratorError = true;
							_iteratorError = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion && _iterator['return']) {
									_iterator['return']();
								}
							} finally {
								if (_didIteratorError) {
									throw _iteratorError;
								}
							}
						}

						if (_Object$keys(vars).length) {
							found = routes[_route];
						}
					}
				}

				if (!found) return 'continue';

				// Add query vars to route:
				if (query) {
					vars.__query__ = {};
					query.split('&').forEach(function (set) {
						var key = set.split('=')[0];
						var value = set.split('=')[1];
						vars.__query__[key] = value;
					});
				}

				// Add the vars to the route as 'data':
				found.data = vars;

				return {
					v: found
				};
				route = _route;
			};

			for (var route in routes) {
				var _iteratorNormalCompletion;

				var _didIteratorError;

				var _iteratorError;

				var _iterator, _step;

				var _ret = _loop(route);

				switch (_ret) {
					case 'continue':
						continue;

					default:
						if (typeof _ret === 'object') return _ret.v;
				}
			}
		}
	}, {
		key: 'CONNECT',
		value: 'CONNECT',
		enumerable: true
	}, {
		key: 'DELETE',
		value: 'DELETE',
		enumerable: true
	}, {
		key: 'GET',
		value: 'GET',
		enumerable: true
	}, {
		key: 'HEAD',
		value: 'HEAD',
		enumerable: true
	}, {
		key: 'POST',
		value: 'POST',
		enumerable: true
	}, {
		key: 'PUT',
		value: 'PUT',
		enumerable: true
	}, {
		key: 'TRACE',
		value: 'TRACE',
		enumerable: true
	}]);

	return Router;
})();

exports['default'] = Router;
module.exports = exports['default'];