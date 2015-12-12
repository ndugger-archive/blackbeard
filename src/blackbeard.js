// Node modules:
import fs from 'fs';
import http from 'http';
import path from 'path';
import url from 'url';

// Dependencies:
import db from 'sequelize';
import filetype from 'file-type';
import redis from 'redis';

// Blackbeard modules:
import _Cache, {
	storeInCache, 
	rememberFromCache, 
	forgetCachedItem
} from './cache';
import _Controller from './controller';
import _DataString from './datastring';
import _File from './file';
import _Media from './media';
import _Model from './model';
import _Request from './request';
import _Requirements, {
	testRequirements
} from './requirements';
import _Router from './router';
import _Session from './session';
import _View from './view';

import { skullXBones } from './ascii';

// Convenient exports:
export const Cache = _Cache;
export const Controller = _Controller;
export const DataString = _DataString;
export const File = _File;
export const Media = _Media;
export const Model = _Model;
export const Request = _Request;
export const Requirements = _Requirements;
export const Router = _Router;
export const Session = _Session;
export const View = _View;

// Mappings to sequelize schema:
export const Schema = {
	String: db.STRING,
	Binary: db.STRING.BINARY,
	Text: db.TEXT,
	Integer: db.INTEGER,
	BigInt: db.BIGINT,
	Float: db.FLOAT,
	Real: db.REAL,
	Double: db.DOUBLE,
	Decimal: db.DECIMAL,
	Date: db.DATE,
	Boolean: db.BOOLEAN,
	Enum: db.ENUM,
	Array: db.ARRAY,
	JSON: db.JSON,
	JSONB: db.JSONB,
	Blob: db.BLOB,
	UUID: db.UUID
};

// Arrgghh, matey!
export default class Blackbeard {
	// Blackbeard objects:
	static Cache = Cache;
	static Controller = Controller;
	static DataString = DataString;
	static File = File;
	static Media = Media;
	static Model = Model;
	static Request = Request;
	static Requirements = Requirements;
	static Router = Router;
	static Session = Session;
	static View = View;
	static Schema = Schema;

	static ready = false;
	static settings = {
		server: { port: 80 }
	};

	// Start the server on specified port:
	static async start (port = this.settings.server.port) {
		try {
			if (!this.ready && !this.settings) {
				throw new Error('Server is not ready or cannot find a blackbeard.settings.json file');
			}
			// Detect possible duplicate routes:
			for (let route in http.routes) {
				if (route.match(/dupe:/)) throw new TypeError(`There are multiple routes with the path of ${route.replace(/dupe:/, '')}`);
			}
			// Apply the port to the Request class for future use:
			if (port) Request.server.port = port;
			// Start the actual HTTP server:
			http.createServer((request, response) => this.__listen__(request, response)).listen(port);
			console.info(`${skullXBones}\n\nBlackbeard is now sailing on port ${port}\n\n`);
		}
		catch (e) {
			console.error(e);
		}
	}

	// Setup upon module inclusion (before server starts):
	static __setup__ () {
		http.routes = {};
		http.controllers = {};

		let settings = fs.readFileSync(path.join(process.cwd(), 'blackbeard.settings.json'), 'utf8');
		if (settings) {
			settings = JSON.parse(settings);

			this.ready = true;
			this.settings = settings;

			if ('server' in settings) Request.server = settings.server;

			// Connect to the database:
			if ('database' in settings) {
				try {
					global.database = new db(
						settings.database.database,
						settings.database.username,
						settings.database.password,
						{
							dialect: settings.database.engine,
							host: settings.database.host,
							port: settings.database.port
						}
					);
				} catch (e) {
					global.database = null;
					console.error(e);
				}
			}

			// Connect to redis server (for caching):
			if ('server' in settings && 'cache' in settings.server && settings.server.cache.enabled) {
				try {
					http.cache = redis.createClient();
					http.cache.defaultMaxAge = settings.server.cache.maxAge || 0;
				} catch (e) {
					http.cache = null;
					console.error(e);
				}
			}
		}
		else {
			console.error('No blackbeard.settings.json file found in', process.cwd());
		}
	}

	// Fires every time a request is made:
	static async __listen__ (request, response) {
		const route = Router.find(request.url);
		const query = url.parse(request.url).query;
		let actionResponse;

		// No route, attempt to send a file:
		if (!route) {
			fs.stat(path.join(process.cwd(), 'dist', request.url), (error, stats) => {
				// If no file exists, send a 404:
				if (error) {
					response.writeHead(404);
					// Check for the existence of the error/404 route first:
					if ('/error/404' in http.routes) {
						const r = http.routes['/error/404'];
						actionResponse = await (r.controller::r.controller[r.action](request, response));
						return this.__send__(actionResponse, request, response);
					}
					return response.end('404 Not Found');
				}
				// If the browser is requesting a range, send Media:
				if ('range' in request.headers) {
					const media = new Media(request.url);
					return media.__send__(request, response);
				}
				// FInall, send a File:
				const file = new File(request.url);
				return file.__send__(request, response);
			});
		}

		// Request method mismatch:
		if (request.method.toUpperCase() !== route.method.toUpperCase() || (!(request.method.toUpperCase() in Router))) {
			response.writeHead(405);
			if ('/error/405' in http.routes) {
				const r = http.routes['/error/405'];
				actionResponse = await (r.controller::r.controller[r.action](request, response));
				return this.__send__(actionResponse, request, response);
			}
			return response.end('405 Invalid HTTP Method');
		}

		actionResponse = await this[`__${request.method.toLowerCase()}__`](route, request, response);
		this.__send__(actionResponse, request, response);
	}

	// Handle the sending of a response:
	static async __send__ (actionResponse, request, response) {
		// No response, send a 204:
		if (!actionResponse) {
			response.writeHead(204);
			return response.end();
		}

		// Does the response have a 'send' method?
		if ('__send__' in actionResponse) {
			return actionResponse.__send__(request, response);
		}

		// Is the response a Buffer?
		if (actionResponse instanceof Buffer) {
			if ('range' in request.headers) {
				return new Media(actionResponse).send(request, response);
			} else {
				response.writeHead(200, filetype(actionResponse).mime);
				response.write(actionResponse);
				return response.end();
			}
		} 

		// Is the response a string or a number?
		if (typeof actionResponse === 'string' || typeof actionResponse === 'number') {
			const dataString = new DataString('text/plain', actionResponse.toString());
			return dataString.__send__(request, response);
		}

		// None of the above? Object? Attempt to send as JSON
		try {
			const dataString = new DataString('application/json', JSON.stringify(actionResponse));
			return dataString.__send__(request, response);
		} catch (e) {
			if ('/error/500' in http.routes) {
				const r = http.routes['/error/405'];
				actionResponse = await (r.controller::r.controller[r.action](request, response));
				return this.__send__(actionResponse, request, response);
			}
			response.write(e);
			response.end();
		}
	}

	// Internal GET request handler:
	static async __get__ (route, request, response) {
		try {
			const controller = route.controller;
			const action = controller[route.action];
			const data = [];

			request.controller = controller;
			request.query = route.data.__query__;
			delete route.data.__query__;

			// Check requirements/authorization:
			if (!(await testRequirements(action.requirements))) {
				if ('/error/401' in http.routes) {
					const r = http.routes['/error/401'];
					return await (r.controller::r.controller[r.action](request, response));
				}
				return response.end('401 Not Authorized');
			}

			for (let key in route.data) {
				data.push(route.data[key]);
			}

			return await (controller::action(...data, request, response));
		}
		catch (e) {
			console.error(e);
		}
	}

	// Internal POST request handler:
	static async __post__ (route, request, response) {
		return new Promise(resolve => {
			let body = new Buffer([]);

			request.on('data', x => {
				body = Buffer.concat([body, x]);
			});

			request.on('end', x => {
				request.body = body;
				resolve(this.__get__(route, request, response));
			});
		});
	}

	// Internal PUT request handler:
	static async __put__ (route, request, response) {
		// It just uses the post handler...
		return this.__post__(route, request, response);
	}
}

if (!Blackbeard.ready) Blackbeard.__setup__();