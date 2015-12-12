import fs from 'fs';
import http from 'http';
import path from 'path';
import marko from 'marko';

import Session from './session';

export default class View {

	constructor (path, data = {}) {
		this.path = path;
		this.data = data;
	}

	render (request, response) {
		const { controller } = request;
		const { controllers } = http;

		let views = path.join(process.cwd(), 'dist', 'views');

		// Add the controller's name to the view path, if existent:
		for (let c in controllers) {
			if (controller === controllers[c].prototype) {
				views = path.join(views, c);
			}
		}

		return new Promise((resolve, reject) => {
			const templatePath = `${path.join(views, this.path)}.marko`;

			fs.readFile(templatePath, 'utf8', async (error, view) => {

				if (error) {
					console.error(error);
					return resolve(null);
				}

				try {
					const template = marko.load(templatePath, view);
					const session = await Session.findSession(request, response);

					if (session) {
						this.data.authenticated = true;
						this.data.session = session;
					}

					template.render(this.data, (error, html) => error ? console.error(error) : resolve(html));
				} catch (e) {
					console.error(e);
				}
			});
		});
	}

	async __send__ (request, response) {
		const view = await this.render(request, response);
		response.writeHead(response.statusCode, { 'Content-Type': 'text/html' });
		response.write(view);
		response.end();
	}

}