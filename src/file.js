import fs from 'fs';
import mime from 'mime';
import path from 'path';

export default class File {
	
	constructor(src) {
		this.src = src;
		this.mime = mime.lookup(src);
	}

	read () {
		return new Promise((resolve, reject) => {
			try {
				fs.readFile(path.join(process.cwd(), this.src), (error, file) => {
					if (error) {
						console.error(error);
						resolve(null);
					} else {
						resolve(file);
					}
				});
			} catch (e) {
				console.error(e);
				resolve(null);
			}
		})
	}
}