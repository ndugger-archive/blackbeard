'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _cache = require('./cache');

function overwrite(name, remember) {
	return function (x) {
		var _arguments = arguments,
		    _this = this;

		var model = this;
		var cache = model.__cache__;
		var original = this.__proto__[name].bind(this);

		if (!cache && !cache.enabled) {
			return _Promise.resolve(original.apply(undefined, arguments));
		}

		return new _Promise(function callee$2$0(resolve) {
			var key,
			    maxAge,
			    cached,
			    args$3$0 = _arguments;
			return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
				while (1) switch (context$3$0.prev = context$3$0.next) {
					case 0:
						key = 'Model::' + model.name;
						maxAge = cache.maxAge;

						if (!remember) {
							context$3$0.next = 10;
							break;
						}

						key += x ? JSON.stringify(args$3$0) : '';
						context$3$0.next = 6;
						return _regeneratorRuntime.awrap((0, _cache.rememberFromCache)(key));

					case 6:
						cached = context$3$0.sent;

						if (cached) {
							resolve(cached);
						} else {
							resolve(original.apply(undefined, args$3$0).then(function (results) {
								return (0, _cache.storeInCache)(key, results, maxAge);
							}));
						}
						context$3$0.next = 11;
						break;

					case 10:
						resolve((0, _cache.forgetCachedItem)(new RegExp(key)).then(original.apply(undefined, args$3$0)));

					case 11:
					case 'end':
						return context$3$0.stop();
				}
			}, null, _this);
		});
	};
}

// Model annotation

exports['default'] = function (model) {

	if (global.database) {

		global.database.define(model.name, new model(), {

			// Overwrite methods to enable caching/invalidation on models:
			classMethods: _http2['default'].cache ? {

				// Find:
				all: overwrite('all', true),
				findAll: overwrite('findAll', true),
				findOne: overwrite('findOne', true),
				findById: overwrite('findById', true),
				findOrCreate: overwrite('findOrCreate', true),
				findCreateFind: overwrite('findCreateFind', true),
				findAndCountAll: overwrite('findAndCountAll', true),
				count: overwrite('count', true),
				max: overwrite('max', true),
				min: overwrite('min', true),
				sum: overwrite('sum', true),
				aggregate: overwrite('aggregate', true),

				// Create:
				create: overwrite('create'),
				bulkCreate: overwrite('bulkCreate'),
				update: overwrite('update'),
				upsert: overwrite('upsert'),
				truncate: overwrite('truncate'),
				drop: overwrite('drop'),
				destroy: overwrite('destroy'),
				restore: overwrite('restore')

			} : {}
		});

		global.database.sync();

		return global.database.models[model.name];
	} else {
		console.error('No database detected');
	}
};

module.exports = exports['default'];