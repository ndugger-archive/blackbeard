// Node modules:
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

// Dependencies:
var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _fileType = require('file-type');

var _fileType2 = _interopRequireDefault(_fileType);

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

// Blackbeard modules:
var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _controller = require('./controller');

var _controller2 = _interopRequireDefault(_controller);

var _datastring = require('./datastring');

var _datastring2 = _interopRequireDefault(_datastring);

var _file = require('./file');

var _file2 = _interopRequireDefault(_file);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _requirements = require('./requirements');

var _requirements2 = _interopRequireDefault(_requirements);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _view = require('./view');

var _view2 = _interopRequireDefault(_view);

// Convenience exports:
var Cache = _cache2['default'];
exports.Cache = Cache;
var Controller = _controller2['default'];
exports.Controller = Controller;
var DataString = _datastring2['default'];
exports.DataString = DataString;
var File = _file2['default'];
exports.File = File;
var Model = _model2['default'];
exports.Model = Model;
var Requirements = _requirements2['default'];
exports.Requirements = Requirements;
var Router = _router2['default'];
exports.Router = Router;
var View = _view2['default'];

exports.View = View;
// Mappings to sequelize schema:
var Schema = {
	String: _sequelize2['default'].STRING,
	Binary: _sequelize2['default'].STRING.BINARY,
	Text: _sequelize2['default'].TEXT,

	Integer: _sequelize2['default'].INTEGER,
	BigInt: _sequelize2['default'].BIGINT,
	Float: _sequelize2['default'].FLOAT,
	Real: _sequelize2['default'].REAL,
	Double: _sequelize2['default'].DOUBLE,
	Decimal: _sequelize2['default'].DECIMAL,

	Date: _sequelize2['default'].DATE,

	Boolean: _sequelize2['default'].BOOLEAN,
	Enum: _sequelize2['default'].ENUM,
	Array: _sequelize2['default'].ARRAY,

	JSON: _sequelize2['default'].JSON,
	JSONB: _sequelize2['default'].JSONB,

	Blob: _sequelize2['default'].BLOB,

	UUID: _sequelize2['default'].UUID
};

exports.Schema = Schema;
// Blackbeard class { Blackbeard.start(port[, options]) }:
var Blackbeard = (function () {
	function Blackbeard() {
		_classCallCheck(this, Blackbeard);
	}

	_createClass(Blackbeard, null, [{
		key: '__setup__',

		// Setup upon module inclusion (before server starts):
		value: function __setup__() {
			// Store relevant objects on http:
			_http2['default'].routes = {};
			_http2['default'].controllers = {};

			var blueprint = _fs2['default'].readFileSync(_path2['default'].join(process.cwd(), 'blackbeard.settings.json'), 'utf8');

			if (blueprint) {
				var settings = JSON.parse(blueprint);

				this.ready = true;
				this.settings = settings;

				// Connect to the database:
				if ('database' in settings) {
					try {
						global.database = new _sequelize2['default'](settings.database.database, settings.database.username, settings.database.password, {
							dialect: settings.database.engine,
							host: settings.database.host,
							port: settings.database.port
						});
					} catch (e) {
						global.database = null;
						console.error(e);
					}
				}

				// Connect to redis server (for caching):
				if ('server' in settings && 'cache' in settings.server && settings.server.cache.enabled) {
					try {
						_http2['default'].cache = _redis2['default'].createClient();
						_http2['default'].cache.defaultMaxAge = settings.server.cache.maxAge || 0;
					} catch (e) {
						_http2['default'].cache = null;
						console.error(e);
					}
				}
			} else {
				console.error('No blackbeard.settings.json file found in', process.cwd());
			}
		}

		// Start the server on specified port:
	}, {
		key: 'start',
		value: function start() {
			var port = arguments.length <= 0 || arguments[0] === undefined ? this.settings.server.port : arguments[0];
			return _regeneratorRuntime.async(function start$(context$2$0) {
				var _this = this;

				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						if (!(!this.ready && !this.settings)) {
							context$2$0.next = 2;
							break;
						}

						return context$2$0.abrupt('return', console.error('Server is not ready or cannot find a blackbeard.settings.json file'));

					case 2:

						// Start the actual HTTP server:
						try {
							_http2['default'].createServer(function (request, response) {
								return _this.__listen__(request, response);
							}).listen(port);
						} catch (e) {
							console.error(e);
						}

					case 3:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}

		// Store item in cache:
	}, {
		key: 'cache',
		value: function cache(key, value, maxAge) {
			return _regeneratorRuntime.async(function cache$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap((0, _cache.storeInCache)(key, value, maxAge));

					case 2:
						return context$2$0.abrupt('return', context$2$0.sent);

					case 3:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}

		// Remember item from cache:
	}, {
		key: 'remember',
		value: function remember(key) {
			return _regeneratorRuntime.async(function remember$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap((0, _cache.rememberFromCache)(key));

					case 2:
						return context$2$0.abrupt('return', context$2$0.sent);

					case 3:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}

		// Forget item in cache:
	}, {
		key: 'forget',
		value: function forget(key) {
			return _regeneratorRuntime.async(function forget$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap((0, _cache.forgetCachedItem)(key));

					case 2:
						return context$2$0.abrupt('return', context$2$0.sent);

					case 3:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}

		// Convenient method for making an HTTP request:
	}, {
		key: 'request',
		value: function request(path) {
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
			return _regeneratorRuntime.async(function request$(context$2$0) {
				var _this2 = this;

				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						return context$2$0.abrupt('return', new _Promise(function callee$2$0(resolve) {
							var request;
							return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
								while (1) switch (context$3$0.prev = context$3$0.next) {
									case 0:
										options.path = path;

										// Allow passing in the full URL as one string:
										if (path.match(/https?:\/\//)) {
											path = _url2['default'].parse(path);
											options.hostname = path.hostname;
											options.path = path.path;
											options.protocol = path.protocol;
											if (path.port) options.port = path.port;
										}

										// If probably local (and no port provided), get port from settings:
										if (!options.hostname && !options.host && !options.port) {
											options.port = this.settings.server.port;
										}

										request = _http2['default'].request(options, function (response) {
											var responseData = new Buffer([]);
											response.on('data', function (data) {
												return responseData = Buffer.concat([responseData, data]);
											});
											response.on('end', function (end) {
												return resolve(responseData);
											});
										});

										request.on('error', function (e) {
											return resolve(console.error(e));
										});

										if (options.body) request.write(options.body);
										request.end();

									case 7:
									case 'end':
										return context$3$0.stop();
								}
							}, null, _this2);
						}));

					case 1:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}

		// Alias for making an HTTP GET request:
	}, {
		key: 'get',
		value: function get(path, options) {
			return _regeneratorRuntime.async(function get$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						if ('body' in options) delete options.body;
						options.method = Router.GET;
						context$2$0.next = 4;
						return _regeneratorRuntime.awrap(this.request(path, options));

					case 4:
						return context$2$0.abrupt('return', context$2$0.sent);

					case 5:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}

		// Alias for making an HTTP POST request:
	}, {
		key: 'post',
		value: function post(path, options) {
			return _regeneratorRuntime.async(function post$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						options.method = Router.POST;
						context$2$0.next = 3;
						return _regeneratorRuntime.awrap(this.request(path, options));

					case 3:
						return context$2$0.abrupt('return', context$2$0.sent);

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}

		// Fires every time a request is made:
	}, {
		key: '__listen__',
		value: function __listen__(request, response) {
			var route, query, cachedResponse, routeResponse, actionCache, cacheKey, file, content;
			return _regeneratorRuntime.async(function __listen__$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						route = Router.find(request.url);
						query = _url2['default'].parse(request.url).query;
						cachedResponse = undefined;
						routeResponse = undefined;

						if (!route) {
							context$2$0.next = 80;
							break;
						}

						actionCache = route.controller[route.action].__cache__;
						cacheKey = 'Action::' + route.controller.constructor.name + '.' + route.action + (query ? '::' + query : '');

						if (!(request.method.toUpperCase() !== route.method.toUpperCase())) {
							context$2$0.next = 10;
							break;
						}

						response.writeHead(405);
						return context$2$0.abrupt('return', response.end());

					case 10:
						if (!(actionCache && actionCache.enabled)) {
							context$2$0.next = 18;
							break;
						}

						context$2$0.next = 13;
						return _regeneratorRuntime.awrap(this.remember(cacheKey));

					case 13:
						cachedResponse = context$2$0.sent;

						if (!cachedResponse) {
							context$2$0.next = 18;
							break;
						}

						response.writeHead(200, { 'Content-Type': cachedResponse.mime });
						response.write(cachedResponse.content);
						return context$2$0.abrupt('return', response.end());

					case 18:
						context$2$0.t0 = request.method.toUpperCase();
						context$2$0.next = context$2$0.t0 === Router.GET ? 21 : context$2$0.t0 === Router.POST ? 25 : context$2$0.t0 === Router.PUT ? 29 : 33;
						break;

					case 21:
						context$2$0.next = 23;
						return _regeneratorRuntime.awrap(this.__get__(route, request, response));

					case 23:
						routeResponse = context$2$0.sent;
						return context$2$0.abrupt('break', 33);

					case 25:
						context$2$0.next = 27;
						return _regeneratorRuntime.awrap(this.__post__(route, request, response));

					case 27:
						routeResponse = context$2$0.sent;
						return context$2$0.abrupt('break', 33);

					case 29:
						context$2$0.next = 31;
						return _regeneratorRuntime.awrap(this.__post__(route, request, response));

					case 31:
						routeResponse = context$2$0.sent;
						return context$2$0.abrupt('break', 33);

					case 33:
						if (!routeResponse) {
							context$2$0.next = 76;
							break;
						}

						context$2$0.t1 = true;
						context$2$0.next = context$2$0.t1 === (typeof routeResponse === 'string') ? 37 : context$2$0.t1 === (typeof routeResponse === 'number') ? 39 : context$2$0.t1 === routeResponse instanceof View ? 41 : context$2$0.t1 === routeResponse instanceof File ? 46 : context$2$0.t1 === routeResponse instanceof Buffer ? 52 : context$2$0.t1 === routeResponse instanceof DataString ? 54 : context$2$0.t1 === routeResponse instanceof Object ? 56 : 67;
						break;

					case 37:
						routeResponse = {
							mime: 'text/plain',
							content: routeResponse
						};return context$2$0.abrupt('break', 70);

					case 39:
						routeResponse = {
							mime: 'text/plain',
							content: routeResponse.toString()
						};return context$2$0.abrupt('break', 70);

					case 41:
						context$2$0.next = 43;
						return _regeneratorRuntime.awrap(routeResponse.render(request.controller));

					case 43:
						context$2$0.t2 = context$2$0.sent;
						routeResponse = {
							mime: 'text/html',
							content: context$2$0.t2
						};
						return context$2$0.abrupt('break', 70);

					case 46:
						context$2$0.t3 = routeResponse.mime;
						context$2$0.next = 49;
						return _regeneratorRuntime.awrap(routeResponse.read());

					case 49:
						context$2$0.t4 = context$2$0.sent;
						routeResponse = {
							mime: context$2$0.t3,
							content: context$2$0.t4
						};
						return context$2$0.abrupt('break', 70);

					case 52:
						routeResponse = {
							mime: (0, _fileType2['default'])(routeResponse).mime,
							content: routeResponse
						};return context$2$0.abrupt('break', 70);

					case 54:
						routeResponse = {
							mime: routeResponse.mime,
							content: routeResponse.data.toString()
						};return context$2$0.abrupt('break', 70);

					case 56:
						context$2$0.prev = 56;

						routeResponse = {
							mime: 'application/json',
							content: JSON.stringify(routeResponse)
						};return context$2$0.abrupt('break', 70);

					case 61:
						context$2$0.prev = 61;
						context$2$0.t5 = context$2$0['catch'](56);

						console.error(context$2$0.t5);
						response.writeHead(500);
						response.end();
						return context$2$0.abrupt('return');

					case 67:
						response.writeHead(500);
						response.end();
						return context$2$0.abrupt('return');

					case 70:

						// If action is cachable, store in redis:
						if (actionCache && actionCache.enabled) {
							this.cache(cacheKey, routeResponse, actionCache.maxAge);
						}

						// Respond:
						response.writeHead(200, { 'Content-Type': routeResponse.mime });
						response.write(routeResponse.content);
						response.end();
						context$2$0.next = 78;
						break;

					case 76:
						response.writeHead(204);
						response.end();

					case 78:
						context$2$0.next = 86;
						break;

					case 80:
						file = new File(request.url);
						context$2$0.next = 83;
						return _regeneratorRuntime.awrap(file.read());

					case 83:
						content = context$2$0.sent;

						if (content) {
							response.writeHead({ 'Content-Type': file.mime });
							response.write(content);
						} else {
							response.writeHead(404);
						}

						response.end();

					case 86:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this, [[56, 61]]);
		}

		// Internal GET request handler:
	}, {
		key: '__get__',
		value: function __get__(route) {
			var request = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
			var response = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
			return _regeneratorRuntime.async(function __get__$(context$2$0) {
				var _this3 = this;

				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						return context$2$0.abrupt('return', new _Promise(function callee$2$0(resolve) {
							var controller, action, data, key, routeResponse;
							return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
								while (1) switch (context$3$0.prev = context$3$0.next) {
									case 0:
										controller = route.controller;
										action = controller[route.action];
										data = [];

										if ('__query__' in route.data) {
											request.query = route.data.__query__;
											delete route.data.__query__;
										}

										for (key in route.data) {
											data.push(route.data[key]);
										}

										request.controller = controller;

										context$3$0.next = 8;
										return _regeneratorRuntime.awrap(action.call.apply(action, [controller].concat(data, [request, response])));

									case 8:
										routeResponse = context$3$0.sent;

										resolve(routeResponse);

									case 10:
									case 'end':
										return context$3$0.stop();
								}
							}, null, _this3);
						}));

					case 1:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}

		// Internal POST/PUT request handler:
	}, {
		key: '__post__',
		value: function __post__(route) {
			var request = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
			var response = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
			return _regeneratorRuntime.async(function __post__$(context$2$0) {
				var _this5 = this;

				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						return context$2$0.abrupt('return', new _Promise(function callee$2$0(resolve) {
							return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
								var _this4 = this;

								while (1) switch (context$3$0.prev = context$3$0.next) {
									case 0:
										request.on('data', function callee$3$0(x) {
											return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
												while (1) switch (context$4$0.prev = context$4$0.next) {
													case 0:
														request.body = x.toString();
														resolve(this.__get__(route, request, response));

													case 2:
													case 'end':
														return context$4$0.stop();
												}
											}, null, _this4);
										});

									case 1:
									case 'end':
										return context$3$0.stop();
								}
							}, null, _this5);
						}));

					case 1:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'Cache',

		// Blackbeard objects:
		value: Cache,
		enumerable: true
	}, {
		key: 'Controller',
		value: Controller,
		enumerable: true
	}, {
		key: 'DataString',
		value: DataString,
		enumerable: true
	}, {
		key: 'File',
		value: File,
		enumerable: true
	}, {
		key: 'Model',
		value: Model,
		enumerable: true
	}, {
		key: 'Requirements',
		value: Requirements,
		enumerable: true
	}, {
		key: 'Router',
		value: Router,
		enumerable: true
	}, {
		key: 'View',
		value: View,

		// Requirements helper functions:
		enumerable: true
	}, {
		key: 'isAuthenticated',
		value: _requirements.isAuthenticated,

		// Provide access to Sequelize types:
		enumerable: true
	}, {
		key: 'Schema',
		value: Schema,
		enumerable: true
	}, {
		key: 'ready',
		value: false,
		enumerable: true
	}, {
		key: 'settings',
		value: {
			server: { port: 80 }
		},
		enumerable: true
	}]);

	return Blackbeard;
})();

exports['default'] = Blackbeard;

if (!Blackbeard.ready) Blackbeard.__setup__();

// Route exists:

// Wrong request type on route:

// Action's cache enabled:
// Find cached response:

// Found cached response:

// No cached response found, do action:
// GET:

// POST:

// PUT:

// Received a response:
// String/Text:

// Number (as text):

// View:

// File:

// Buffer:

// DataString:

// Object (try to send as JSON):

// Unsupported response:
// No response, send a 204:
// No route, attempt to serve a file: