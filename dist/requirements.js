'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _this = this;

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var isAuthenticated = function isAuthenticated() {
	var strategy = arguments.length <= 0 || arguments[0] === undefined ? 'local' : arguments[0];
	var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	return true;
};

exports.isAuthenticated = isAuthenticated;

exports['default'] = function callee$0$0() {
	var rules = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

	var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, rule;

	return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
		while (1) switch (context$1$0.prev = context$1$0.next) {
			case 0:

				if (!Array.isArray(rules)) {
					rules = [rules];
				}

				reqsMet = true;
				_iteratorNormalCompletion = true;
				_didIteratorError = false;
				_iteratorError = undefined;
				context$1$0.prev = 5;
				_iterator = _getIterator(rules);

			case 7:
				if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
					context$1$0.next = 18;
					break;
				}

				rule = _step.value;

				if (!(typeof rule !== 'boolean')) {
					context$1$0.next = 12;
					break;
				}

				console.error('Requirements must be of type boolean');
				return context$1$0.abrupt('break', 18);

			case 12:
				if (!(rule === false)) {
					context$1$0.next = 15;
					break;
				}

				reqsMet = false;
				return context$1$0.abrupt('break', 18);

			case 15:
				_iteratorNormalCompletion = true;
				context$1$0.next = 7;
				break;

			case 18:
				context$1$0.next = 24;
				break;

			case 20:
				context$1$0.prev = 20;
				context$1$0.t0 = context$1$0['catch'](5);
				_didIteratorError = true;
				_iteratorError = context$1$0.t0;

			case 24:
				context$1$0.prev = 24;
				context$1$0.prev = 25;

				if (!_iteratorNormalCompletion && _iterator['return']) {
					_iterator['return']();
				}

			case 27:
				context$1$0.prev = 27;

				if (!_didIteratorError) {
					context$1$0.next = 30;
					break;
				}

				throw _iteratorError;

			case 30:
				return context$1$0.finish(27);

			case 31:
				return context$1$0.finish(24);

			case 32:

				console.log(reqsMet);

				return context$1$0.abrupt('return', function (controller, action, descriptor) {

					return descriptor;
				});

			case 34:
			case 'end':
				return context$1$0.stop();
		}
	}, null, _this, [[5, 20, 24, 32], [25,, 27, 31]]);
};