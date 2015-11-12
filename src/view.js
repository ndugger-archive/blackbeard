import fs from 'fs';
import http from 'http';
import path from 'path';

import marko from 'marko';

export default class View {

	constructor (path, data = {}, layout = null) {
		this.path = path;
		this.data = data;
		this.layout = layout;
	}

	render (controller, layout = this.layout) {
		const controllers = http.controllers;

		let views = path.join(process.cwd(), 'dist', 'views');

		if (layout) {
			layout = path.join(views, layout);
		}

		// Add the controller's name to the view path, if existent:
		for (let c in controllers) {
			if (controller === controllers[c].prototype) {
				views = path.join(views, c);
			}
		}

		return new Promise((resolve, reject) => {
			const templatePath = `${path.join(views, this.path)}.marko`;

			fs.readFile(templatePath, 'utf8', (error, view) => {

				if (error) {
					console.error(error);
					return resolve(null);
				}

				const template = marko.load(templatePath, view);
				template.render(this.data, (error, html) => error ? console.error(error) : resolve(html));

			});
		});
	}
}