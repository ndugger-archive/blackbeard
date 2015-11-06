'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

exports['default'] = function (controller) {
	var controllers = _http2['default'].controllers;

	var name = controller.name.toLowerCase().replace(/controller|ctrlr?/, '');

	controllers[name] = controller;

	return new controller();
};

module.exports = exports['default'];