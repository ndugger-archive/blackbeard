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
import _Model from './model';
import _Requirements, {
	isAuthenticated
} from './requirements';
import _Router from './router';
import _View from './view';

// Convenient exports:
export const Cache = _Cache;
export const Controller = _Controller;
export const DataString = _DataString;
export const File = _File;
export const Model = _Model;
export const Requirements = _Requirements;
export const Router = _Router;
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

// Blackbeard class { Blackbeard.start(port[, options]) }:
export default class Blackbeard {

	// Blackbeard objects:
	static Cache = Cache;
	static Controller = Controller;
	static DataString = DataString;
	static File = File;
	static Log = Log;
	static Model = Model;
	static Requirements = Requirements;
	static Router = Router;
	static View = View;

	// Requirements helper functions:
	static isAuthenticated = isAuthenticated;

	// Provide access to Sequelize types:
	static Schema = Schema;

	static ready = false;
	static settings = {
		server: { port: 80 }
	};

	// Setup upon module inclusion (before server starts):
	static __setup__ () {
		// Store relevant objects on http:
		http.routes = {};
		http.controllers = {};

		let settings = fs.readFileSync(path.join(process.cwd(), 'blackbeard.settings.json'), 'utf8');

		if (settings) {
			settings = JSON.parse(settings);

			this.ready = true;
			this.settings = settings;

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

		} else {
			console.error('No blackbeard.settings.json file found in', process.cwd());
		}
	}

	// Start the server on specified port:
	static async start (port = this.settings.server.port) {
		if (!this.ready && !this.settings) {
			return console.error('Server is not ready or cannot find a blackbeard.settings.json file');
		}

		// Start the actual HTTP server:
		try {
			http.createServer((request, response) => this.__listen__(request, response)).listen(port);
		} catch (e) {
			console.error(e);
		}
	}

	// Store item in cache:
	static async cache (key, value, maxAge) {
		return await storeInCache(key, value, maxAge);
	}

	// Remember item from cache:
	static async remember (key) {
		return await rememberFromCache(key);
	}

	// Forget item in cache:
	static async forget (key) {
		return await forgetCachedItem(key);
	}

	// Convenient method for making an HTTP request:
	static async request (path, options = {}) {
		return new Promise(async resolve => {
			options.path = path;

			// Allow passing in the full URL as one string:
			if (path.match(/https?:\/\//)) {
				path = url.parse(path);
				options.hostname = path.hostname;
				options.path = path.path;
				options.protocol = path.protocol;
				if (path.port) options.port = path.port;
			}

			// If probably local (and no port provided), get port from settings:
			if (!options.hostname && !options.host && !options.port) {
				options.port = this.settings.server.port;
			}

			const request = http.request(options, response => {
				let responseData = new Buffer([]);
				response.on('data', data => responseData = Buffer.concat([responseData, data]));
				response.on('end', end => resolve(responseData));
			});

			request.on('error', e => resolve(console.error(e)));

			if (options.body) request.write(options.body);
			request.end();
		});
	}

	// Alias for making an HTTP GET request:
	static async get (path, options) {
		if ('body' in options) delete options.body;
		options.method = Router.GET;
		return await this.request(path, options);
	}

	// Alias for making an HTTP POST request:
	static async post (path, options) {
		options.method = Router.POST;
		return await this.request(path, options);
	}

	// Fires every time a request is made:
	static async __listen__ (request, response) {
		const route = Router.find(request.url);
		const query = url.parse(request.url).query

		let cachedResponse;
		let routeResponse;

		// Route exists:
		if (route) {
			const actionCache = route.controller[route.action].__cache__;
			const cacheKey = `Action::${route.controller.constructor.name}.${route.action}${query ? `::${query}` : ``}`;

			// Wrong request type on route:
			if (request.method.toUpperCase() !== route.method.toUpperCase()) {
				response.writeHead(405);
				return response.end();
			}

			// Action's cache enabled:
			if (actionCache && actionCache.enabled) {
				// Find cached response:
				cachedResponse = await this.remember(cacheKey);

				// Found cached response:
				if (cachedResponse) {
					response.writeHead(200, { 'Content-Type': cachedResponse.mime });
					response.write(cachedResponse.content);
					return response.end();
				}
			}

			// No cached response found, do action:
			switch (request.method.toUpperCase()) {
				// GET:
				case Router.GET: 
					routeResponse = await this.__get__(route, request, response); break;

				// POST:
				case Router.POST: 
					routeResponse = await this.__post__(route, request, response); break;

				// PUT:
				case Router.PUT: 
					routeResponse = await this.__post__(route, request, response); break;
			}

			// Received a response:
			if (routeResponse) {

				switch (true) {
					// String/Text:
					case typeof routeResponse === 'string': routeResponse = {
						mime: 'text/plain',
						content: routeResponse
					}; break;

					// Number (as text):
					case typeof routeResponse === 'number': routeResponse = {
						mime: 'text/plain',
						content: routeResponse.toString()
					}; break;

					// View:
					case routeResponse instanceof View: routeResponse = {
						mime: 'text/html',
						content: await routeResponse.render(
							request.controller, 
							this.settings.views ? this.settings.views.layout : undefined
						)
					}; break;

					// File:
					case routeResponse instanceof File: routeResponse = {
						mime: routeResponse.mime,
						content: await routeResponse.read()
					}; break;

					// Buffer:
					case routeResponse instanceof Buffer: routeResponse = {
						mime: filetype(routeResponse).mime,
						content: routeResponse
					}; break;

					// DataString:
					case routeResponse instanceof DataString: routeResponse = {
						mime: routeResponse.mime,
						content: routeResponse.data.toString()
					}; break;

					// Object (try to send as JSON):
					case routeResponse instanceof Object: try { 
						routeResponse = {
							mime: 'application/json',
							content: JSON.stringify(routeResponse)
						}; break;
					} catch (e) {
						console.error(e);
						response.writeHead(500);
						response.end();
						return;
					}

					// Unsupported response:
					default: {
						response.writeHead(500);
						response.end();
						return;
					}
				}

				// If action is cachable, store in redis:
				if (actionCache && actionCache.enabled) {
					this.cache(cacheKey, routeResponse, actionCache.maxAge);
				}

				// Respond:
				response.writeHead(200, { 'Content-Type': routeResponse.mime });
				response.write(routeResponse.content);
				response.end();
			}
			// No response, send a 204:
			else {
				response.writeHead(204);
				response.end();
			}
		} 
		// No route, attempt to serve a file:
		else {
			const file = new File(request.url);
			const content = await file.read();

			if (content) {
				response.writeHead({ 'Content-Type': file.mime });
				response.write(content);
			} else {
				response.writeHead(404);
			}

			response.end();
		}
	}

	// Internal GET request handler:
	static async __get__ (route, request = {}, response = {}) {
		return new Promise(async resolve => {
			const controller = route.controller;
			const action = controller[route.action];
			const data = [];

			if ('__query__' in route.data) {
				request.query = route.data.__query__;
				delete route.data.__query__;
			}

			for (let key in route.data) {
				data.push(route.data[key]);
			}

			request.controller = controller;

			const routeResponse = await (controller::action(...data, request, response));

			resolve(routeResponse);
		});
	}

	// Internal POST/PUT request handler:
	static async __post__ (route, request = {}, response = {}) {
		return new Promise(async resolve => {
			request.on('data', async x => {
				request.body = x.toString();
				resolve(this.__get__(route, request, response));
			});
		});
	}
}

if (!Blackbeard.ready) Blackbeard.__setup__();