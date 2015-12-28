import fs from 'fs';
import http from 'http';
import mime from 'mime';
import path from 'path';

import { storeInCache, rememberFromCache } from './cache';

import Request from './request';

export default class File {
	
	constructor(src) {
		this.src = src;
		this.mime = mime.lookup(src);
	}

	__read__ () {
		return fs.readFileAsync(path.join(process.cwd(), 'dist', this.src));
	}

	async __send__ (request, response, settings) {
		const file = await this.__read__();
		const cKey = `Action::${request.url}`;

		if (response.cache && !(await rememberFromCache(cKey))) storeInCache(cKey, file, settings.server.cache.maxAge);

		response.writeHead(response.statusCode, { 'Content-Type': this.mime });
		response.write(file);
		response.end();
	}
}