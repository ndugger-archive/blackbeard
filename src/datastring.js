import log from './log';

export default class DataString {

	constructor (mime = 'application/json', data = null) {
		this.mime = mime;
		this.data = data;
	}

	__send__ (request, response) {
		if (!this.data) response.statusCode = 404;
		response.writeHead(response.statusCode, { 'Content-Type': this.mime });
		response.write(this.data.toString());
		response.end();
	}

}