import fs from 'fs';
import http from 'http';
import path from 'path';

export default (type, message, route = '?') => {
	const msg = Number(message) in http.STATUS_CODES ? `${message} ${http.STATUS_CODES[message]}` : `500 ${message}`;
	const line = `[${new Date().toLocaleString()}] [${type}] ${msg}: ${route}\n`;
	fs.appendFile(path.join(process.cwd(), 'blackbeard.log'), line, 'utf8', error => {
		if (error) console.error(error);
	});
}