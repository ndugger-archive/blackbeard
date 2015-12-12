import fs from 'fs';
import http from 'http';
import mime from 'mime';
import path from 'path';

export default class File {
	
	constructor(src) {
		this.src = src;
		this.mime = mime.lookup(src);
	}

	read () {
		return new Promise((resolve, reject) => {
			fs.readFile(path.join(process.cwd(), 'dist', this.src), (error, file) => {
				if (error) {
					resolve(null);
				} else {
					resolve(file);
				}
			});
		})
	}

	async __send__ (request, response) {
		const file = await this.read();
		response.writeHead(response.statusCode, { 'Content-Type': this.mime });
		response.write(file);
		response.end();
	}
}