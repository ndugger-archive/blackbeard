import fs from 'fs';
import path from 'path';
import stream from 'stream';

import mime from 'mime';
import filetype from 'file-type';

const { Readable } = stream;

export default class Media {

	constructor (src) {
		this.src = src;

		if (this.src instanceof Buffer) {
			this.mime = filetype(this.src).mime;
		} else {
			this.mime = mime.lookup(this.src);
		}
	}

	stats (request) {
		const { range } = request.headers;
		const file = path.join(process.cwd(), 'dist', this.src);

		return new Promise(resolve => {
			fs.stat(file, (error, stats) => {

				if (error) {
					console.error(error);
					stats = { size: 0 };
				}

				resolve(stats);

			});
		});
	}

	async __send__ (request, response) {
		const { range } = request.headers;
		const { size } = await this.stats(request);
		const positions = range.replace(/bytes=/, '').split('-');
		const start = Number(positions[0]);
		const end = positions[1] ? Number(positions[1]) : size - 1;
		const chunk = end - start + 1;

		// If Buffer, stream buffer
		if (this.src instanceof Buffer) {
			let offset = 0;
			const stream = new Readable({
				read (size) {
					this.push(size ? this.src.slice(offset, size) : null);
					offset = size;
				}
			});

			response.writeHead(206, {

			});

			stream.pipe(response);
		}
		// If not a Buffer, stream a file
		else {

			response.writeHead(206, {
				'Content-Range': `bytes ${start}-${end}/${size}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': chunk,
				'Content-Type': this.mime
			});

			const file = path.join(process.cwd(), 'dist', this.src);
			const stream = fs.createReadStream(file, { start, end });
			stream.on('open', () => stream.pipe(response));
			stream.on('error', error => response.end(error));
		}
	}

}