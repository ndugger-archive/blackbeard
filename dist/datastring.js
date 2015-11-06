'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var DataString = function DataString() {
	var mime = arguments.length <= 0 || arguments[0] === undefined ? 'application/json' : arguments[0];
	var data = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

	_classCallCheck(this, DataString);

	this.mime = mime;
	this.data = data;
};

exports['default'] = DataString;
module.exports = exports['default'];