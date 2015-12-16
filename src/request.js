import http from 'http';
import url from 'url';

import { GET, POST } from './router';

export default class Request {

	constructor (path = '', options = {}) {
		try {
			this.options = { ...options, path };

			if (path.match(/https?:\/\//)) {
				path = url.parse(path);
				this.options.hostname = path.hostname;
				this.options.path = path.path;
				this.options.protocol = path.protocol;
				if (path.port) this.options.port = path.port;
			}

			else this.options.port = http.currentPort;

		} catch (e) {
			console.error(e);
		}
	}

	get () {
		return new Promise(resolve => {
			try {
				this.options.method = GET;
				const request = http.request(this.options, response => {
					let responseData = new Buffer([]);
					response.on('data', data => responseData = Buffer.concat([responseData, data]));
					response.on('end', end => resolve(responseData));
				});
				request.on('error', e => { throw new Error(e) });
				request.end();
			} catch (e) {
				console.error(e);
			}
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
			request.end();
		});
	}

	__send__ () {
		
	}

}