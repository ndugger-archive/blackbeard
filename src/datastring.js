export default class DataString {

	constructor (mime = 'application/json', data = '') {
		this.mime = mime;
		this.data = data;
	}

	__send__ (request, response) {

		if (!this.data) {
			this.data = '{ "error": 404 }';
			this.mime = 'application/json';
			response.writeHead(404);
		}

		response.writeHead(response.statusCode, { 'Content-Type': this.mime });
		response.write(this.data.toString());
		response.end();
	}

}