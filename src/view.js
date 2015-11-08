import ejs from 'ejs-locals';
import fs from 'fs';
import http from 'http';
import path from 'path';

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
			fs.readFile(`${path.join(views, this.path)}.ejs`, 'utf8', (error, view) => {

				if (error) {
					console.error(error);
					return resolve(null);
				}

				view = ejs.render(view, { data: this.data });

				// If no layout, just render the view:
				if (!layout) {
					return resolve(view);
				}

				// If a layout is provided, render the view into the layout:
				fs.readFile(`${layout}.ejs`, 'utf8', (error, layout) => {

					if (error) {
						console.error(error);
						return resolve(null);
					}

					resolve(ejs.render(layout, { body: view }));

				});

			});
		});
	}
}