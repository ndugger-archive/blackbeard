'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var File = (function () {
	function File(src) {
		_classCallCheck(this, File);

		this.src = src;
		this.mime = _mime2['default'].lookup(src);
	}

	_createClass(File, [{
		key: 'read',
		value: function read() {
			var _this = this;

			return new _Promise(function (resolve, reject) {
				try {
					_fs2['default'].readFile(_path2['default'].join(process.cwd(), _this.src), function (error, file) {
						if (error) {
							console.error(error);
							resolve(null);
						} else {
							resolve(file);
						}
					});
				} catch (e) {
					console.error(e);
					resolve(null);
				}
			});
		}
	}]);

	return File;
})();

exports['default'] = File;
module.exports = exports['default'];