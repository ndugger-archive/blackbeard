'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var View = (function () {
	function View(path) {
		var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, View);

		this.path = path;
		this.data = data;
	}

	_createClass(View, [{
		key: 'render',
		value: function render(controller) {
			var _this = this;

			var controllers = _http2['default'].controllers;

			var views = _path2['default'].join(process.cwd(), 'views');

			// Add the controller's name to the view path, if existent:
			for (var c in controllers) {
				if (controller === controllers[c].prototype) {
					views = _path2['default'].join(views, c);
				}
			}

			return new _Promise(function (resolve, reject) {
				_fs2['default'].readFile(_path2['default'].join(views, _this.path) + '.ejs', 'utf8', function (error, view) {
					if (error) {
						console.error(error);
						resolve(null);
					} else {
						resolve(_ejs2['default'].render(view, { data: _this.data }));
					}
				});
			});
		}
	}]);

	return View;
})();

exports['default'] = View;
module.exports = exports['default'];