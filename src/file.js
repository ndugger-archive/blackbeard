import fs from 'fs';
import http from 'http';
import mime from 'mime';
import path from 'path';

import Request from './request';

export default class File {
	
	constructor(src) {
		this.src = src;
		this.mime = mime.lookup(src);
	}

	read () {
		return new Promise((resolve, reject) => {
			fs.readFile(path.join(process.cwd(), 'dist', this.src), (error, file) => {
				if (error) {
					resolve(error);
				} else {
					resolve(file);
				}
			});
		})
	}

	async __send__ (request, response) {
		const file = await this.read();

		if (!file || file instanceof Error) {
			response.writeHead(404);
			if ('/error/404' in http.routes) {
				const error = new Request('/error/404', { headers: request.headers });
				response.write(await error.get());
				return response.end();
			}
			return response.end(`Error 404 - ${http.STATUS_CODES[404]}`);
		}

		response.writeHead(response.statusCode, { 'Content-Type': this.mime });
		response.write(file);
		response.end();
	}
}