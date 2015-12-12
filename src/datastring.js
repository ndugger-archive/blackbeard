export default class DataString {

	constructor (mime = 'application/json', data = '') {
		this.mime = mime;
		this.data = data;
	}

	__send__ (request, response) {
		response.writeHead(200, { 'Content-Type': this.mime });
		response.write(this.data.toString());
		response.end();
	}

}