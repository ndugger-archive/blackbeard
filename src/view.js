import ejs from 'ejs';
import fs from 'fs';
import http from 'http';
import path from 'path';

export default class View {

	constructor (path, data = {}) {
		this.path = path;
		this.data = data;
	}

	render (controller) {
		const controllers = http.controllers;

		let views = path.join(process.cwd(), 'views');

		// Add the controller's name to the view path, if existent:
		for (let c in controllers) {
			if (controller === controllers[c].prototype) {
				views = path.join(views, c);
			}
		}

		return new Promise((resolve, reject) => {
			fs.readFile(`${path.join(views, this.path)}.ejs`, 'utf8', (error, view) => {
				if (error) {
					console.error(error);
					resolve(null);
				} else {
					resolve(ejs.render(view, { data: this.data }));
				}
			});
		});
	}
}