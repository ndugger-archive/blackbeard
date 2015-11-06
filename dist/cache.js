'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var storeInCache = function storeInCache(key, value) {
	var maxAge = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

	try {
		if (_http2['default'].cache && value) {
			_http2['default'].cache.set(key, JSON.stringify(value));
			_http2['default'].cache.expire(key, maxAge);
		}
		return _Promise.resolve(value);
	} catch (e) {
		console.error(e);
	}
};

exports.storeInCache = storeInCache;
var rememberFromCache = function rememberFromCache(key) {
	return new _Promise(function (resolve) {
		_http2['default'].cache.get(key, function (error, result) {
			if (result) {
				result = JSON.parse(result);
				if (result.content && result.content.data && result.content.type === 'Buffer') {
					result.content = new Buffer(result.content.data);
				}
				resolve(result);
			} else {
				resolve(null);
			}
		});
	});
};

exports.rememberFromCache = rememberFromCache;
var forgetCachedItem = function forgetCachedItem(key) {
	return new _Promise(function (resolve) {
		if (key instanceof String) {
			_http2['default'].cache.del(key);
			resolve();
		}
		if (key instanceof Function && 'controller' in key) {
			key = new RegExp('Action::' + key.controller.constructor.name + '.' + key.name);
		}
		if (key instanceof RegExp) {
			_http2['default'].cache.keys('*', function (error, keys) {
				keys.forEach(function (k) {
					if (k.match(key)) {
						_http2['default'].cache.del(k);
					}
				});
				resolve();
			});
		}
	});
};

exports.forgetCachedItem = forgetCachedItem;
// @Cache annotation:
exports['default'] = function (seconds, a, b) {

	// Allow using of the annotation without passing in a seconds value:
	if (seconds && typeof seconds !== 'number') {
		var object = seconds;
		var action = a;
		var descriptor = b;
		seconds = _http2['default'].cache ? _http2['default'].cache.defaultMaxAge : 0;

		if (action && descriptor) {
			descriptor.value.__cache__ = {
				enabled: true,
				maxAge: seconds
			};
			return descriptor;
		}

		if (global.database && object instanceof global.database.Model) {
			object.__cache__ = {
				enabled: true,
				maxAge: seconds
			};
		}

		return object;
	}

	return function (object, action, descriptor) {

		if (action) {
			descriptor.value.__cache__ = {
				enabled: true,
				maxAge: seconds
			};
			return descriptor;
		}

		if (global.database && object instanceof global.database.Model) {
			object.__cache__ = {
				enabled: true,
				maxAge: seconds
			};
		}

		return object;
	};
};