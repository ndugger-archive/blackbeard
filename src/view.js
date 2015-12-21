import fs from 'fs';
import http from 'http';
import path from 'path';
import marko from 'marko';

import log from './log';

import Request from './request';
import Session from './session';

export default class View {

	constructor (path, data = {}) {
		this.path = path;
		this.data = data;
	}

	async __render__ (request, response) {
		const { controller } = request;
		const { controllers } = http;

		let views = path.join(process.cwd(), 'dist', 'views');

		// Add the controller's name to the view path, if existent:
		for (let c in controllers) {
			if (controller === controllers[c].prototype) {
				views = path.join(views, c);
			}
		}

		const templatePath = `${path.join(views, this.path)}.marko`;
		const view = await fs.readFileAsync(templatePath, 'utf8');
		const template = marko.load(templatePath, view);
		const session = request.session;

		if (session) {
			this.data.authenticated = true;
			this.data.session = session;
		}

		return new Promise((resolve, reject) => template.render(this.data, (error, html) => {
			if (error) return reject(error);
			resolve(html);
		}));
	}

	async __send__ (request, response) {
		const view = await this.__render__(request, response);

		response.writeHead(response.statusCode, { 'Content-Type': 'text/html' });
		response.write(view);
		response.end();
	}

}