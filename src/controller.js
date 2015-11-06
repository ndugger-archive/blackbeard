import http from 'http';

export default (controller) => {
	const controllers = http.controllers;
	
	const name = controller.name.toLowerCase().replace(/controller|ctrlr?/, '');

	controllers[name] = controller;

	return new controller;
}