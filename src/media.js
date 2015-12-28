import fs from 'fs';
import http from 'http';
import path from 'path';
import stream from 'stream';

import mime from 'mime';
import filetype from 'file-type';

import log from './log';

import Request from './request';

export default class Media {

	constructor (src) {
		this.src = src;
		if (this.src instanceof Buffer) {
			this.mime = filetype(this.src).mime;
		} else {
			this.mime = mime.lookup(this.src);
		}
	}

	stats () {
		const file = path.join(process.cwd(), 'dist', this.src);
		return fs.statAsync(file);
	}

	async __send__ (request, response, settings) {
		const { range } = request.headers;
		const { size } = await this.stats();
		const positions = range.replace(/bytes=/, '').split('-');
		const start = Number(positions[0]);
		const end = positions[1] ? Number(positions[1]) : size - 1;
		const chunk = end - start + 1;
		const cKey = `Action::${request.url}`;

		// If Buffer, stream buffer:
		if (this.src instanceof Buffer) {

			// Check to see if we should cache this buffer:
			if (response.cache && !(await rememberFromCache(cKey))) storeInCache(cKey, this.src, settings.server.cache.maxAge);

			let offset = 0;
			const stream = new stream.Readable({
				read (size) {
					this.push(size ? this.src.slice(offset, size) : null);
					offset = size;
				}
			});
			response.writeHead(206, {

			});
			return stream.pipe(response);
		}

		// If not a Buffer, stream a file:
		const file = path.join(process.cwd(), 'dist', this.src);
		const stream = fs.createReadStream(file, { start, end });
		response.writeHead(206, {
			'Content-Range': `bytes ${start}-${end}/${size}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunk,
			'Content-Type': this.mime
		});
		stream.on('open', () => stream.pipe(response));
		stream.on('error', error => response.end(error));

		// Read the file again and store in cache, if enabled:
		if (response.cache && !(await rememberFromCache(cKey))) {
			fs.readFile(file, (error, file) => {
				if (error) throw new Error(error);
				storeInCache(cKey, file, settings.server.cache.maxAge);
			});
		}
	}

}