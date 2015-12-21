import fs from 'fs';
import http from 'http';
import mime from 'mime';
import path from 'path';

import log from './log';

import Request from './request';

export default class File {
	
	constructor(src) {
		this.src = src;
		this.mime = mime.lookup(src);
	}

	__read__ () {
		return fs.readFileAsync(path.join(process.cwd(), 'dist', this.src));
	}

	async __send__ (request, response) {
		const file = await this.__read__();

		response.writeHead(response.statusCode, { 'Content-Type': this.mime });
		response.write(file);
		response.end();
	}
}