import fs from 'fs';
import path from 'path';
import mime from 'mime';

export default class Media {

	constructor (src) {
		this.src = src;
		this.mime = mime.lookup(src);
	}

	read (request, response) {
		const { range } = request.headers;
		const positions = range.replace(/bytes=/, '').split('-');
		const start = Number(positions[0]);

		const file = path.join(process.cwd(), 'dist', this.src);

		fs.stat(file, (error, stats) => {

			if (error) { return console.error(error) }

			const { size } = stats;
			const end = positions[1] ? Number(positions[1]) : size - 1;
			const chunk = end - start + 1;

			response.writeHead(206, {
				'Content-Range': `bytes ${start}-${end}/${size}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': chunk,
				'Content-Type': this.mime
			});

			const stream = fs.createReadStream(file, { start, end });
			stream.on('open', () => stream.pipe(response));
			stream.on('error', error => response.end(error));

		});
	}

}