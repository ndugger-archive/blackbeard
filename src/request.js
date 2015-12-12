import http from 'http';
import url from 'url';

import { GET, POST } from './router';

// TODO get settings from Blackbeard:
const settings = {};

export default class Request {

	static server = {};

	constructor (path = '', options) {
		this.options = { ...options, path };

		if (path.match(/https?:\/\//)) {
			path = url.parse(path);
			this.options.hostname = path.hostname;
			this.options.path = path.path;
			this.options.protocol = path.protocol;
			if (path.port) this.options.port = path.port;
		}

		if (!options.hostname && !options.host && !options.port) {
			options.port = this.server.port;
		}
	}

	get () {
		return new Promise(resolve => {
			this.options.method = GET;
			const request = http.request(this.options, response => {
				let responseData = new Buffer([]);
				response.on('data', data => responseData = Buffer.concat([responseData, data]));
				response.on('end', end => resolve(responseData));
			});
			request.on('error', e => resolve(new Error(e)));
		});
	}

	post (data) {
		return new Promise(resolve => {
			this.options.method = POST;
			const request = http.request(this.options, response => {
				let responseData = new Buffer([]);
				response.on('data', data => responseData = Buffer.concat([responseData, data]));
				response.on('end', end => resolve(responseData));
			});
			request.on('error', e => resolve(new Error(e)));
			request.write(data);
		});
	}

	__send__ () {
		
	}

}