// Node modules:
import fs from 'fs';
import http from 'http';
import path from 'path';
import url from 'url';

// Dependencies:
import filetype from 'file-type';
import Database from 'sequelize';
import Redis from 'redis';

// Blackbeard modules:
import _Cache, {
	storeInCache, 
	rememberFromCache, 
	forgetCachedItem
} from './cache';
import _Controller from './controller';
import _DataString from './datastring';
import _EnableCORS from './enablecors';
import _File from './file';
import _Media from './media';
import _Model from './model';
import _Request from './request';
import _Requirements from './requirements';
import _Router from './router';
import _Session from './session';
import _View from './view';

// Custom error logging:
import log from './log';

// Bluebird & promisify the fs API:
import Promise from 'bluebird';
Promise.promisifyAll(fs);

// Convenient exports:
export const Cache = _Cache;
export const Controller = _Controller;
export const DataString = _DataString;
export const EnableCORS = _EnableCORS;
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
	String: Database.STRING,
	Binary: Database.STRING.BINARY,
	Text: Database.TEXT,
	Integer: Database.INTEGER,
	BigInt: Database.BIGINT,
	Float: Database.FLOAT,
	Real: Database.REAL,
	Double: Database.DOUBLE,
	Decimal: Database.DECIMAL,
	Date: Database.DATE,
	Boolean: Database.BOOLEAN,
	Enum: Database.ENUM,
	Array: Database.ARRAY,
	JSON: Database.JSON,
	JSONB: Database.JSONB,
	Blob: Database.BLOB,
	UUID: Database.UUID
};

// Arrgghh, matey!
export default class Blackbeard {
	
	// Blackbeard objects:
	static Cache = Cache;
	static Controller = Controller;
	static DataString = DataString;
	static EnableCORS = EnableCORS;
	static File = File;
	static Media = Media;
	static Model = Model;
	static Request = Request;
	static Requirements = Requirements;
	static Router = Router;
	static Session = Session;
	static View = View;
	static Schema = Schema;

	static log = log;

	static ready = false;
	static settings = { server: { port: http.globalAgent.defaultPort } };

	// Start the server on specified port:
	static async start (port = this.settings.server.port) {
		try {

			console.info('Shivering me timbers (starting server)...');

			if (!this.ready || !this.settings) {
				throw new Error(`Server is not ready or cannot find a valid blackbeard.config file in ${process.cwd()}`);
			}

			// Detect possible duplicate routes:
			for (let route in http.routes) {
				if (route.match(/dupe:/)) throw new TypeError(`There are multiple routes with the path of ${route.replace(/dupe:/, '')}`);
			}

			// Apply the port http for future use:
			http.globalAgent.currentPort = port;

			// Start the actual HTTP server:
			http.createServer((request, response) => this.__listen__(request, response)).listen(port);

			const msg = `  Blackbeard is now sailing on port ${port}  `;
			console.info(`|${new Array(msg.length+1).join('‾')}|\n|${msg}|\n|${new Array(msg.length+1).join('_')}|\n\n`);
		}
		catch (e) {
			log('error', e, 'Blackbeard.start');
		}
	}

	// Setup upon module inclusion (before server starts):
	static __setup__ () {

		console.info('Charting course (running setup)...');

		http.routes = {};
		http.controllers = {};

		let settings = fs.readFileSync(path.join(process.cwd(), 'blackbeard.config'), 'utf8');

		if (settings) try {
			settings = JSON.parse(settings);
			this.ready = true;
			this.settings = settings;

			// Connect to the database:
			if ('database' in settings) global.database = new Database(
				settings.database.database,
				settings.database.username,
				settings.database.password,
				{
					dialect: settings.database.engine,
					host: settings.database.host,
					port: settings.database.port,
					logging: null
				}
			);

			// Connect to Redis server (for caching and session storage):
			if ('server' in settings && 'redis' in settings.server && settings.server.redis.enabled) {
				const { username, password, host, port } = settings.server.redis;
				let options;

				if (username && password) {
					options = `redis://${username}:${password}@${host}:${port}`;
				}
				else {
					options = { host, port };
				}

				http.cache = Redis.createClient(options);
				http.cache.defaultMaxAge = settings.server.redis.defaultMaxAge || 0;
			}
		}
		catch (e) {
			this.ready = false;
			global.database = null;
			http.cache = null;
			log('error', e, 'Blackbeard.__setup__');
		}
	}

	// Fires every time a request is made:
	static async __listen__ (request, response) {
		const route = Router.find(request.url);

		// No route (and method is GET), attempt to send a file:
		if (!route) try {
			await fs.statAsync(path.join(process.cwd(), 'dist', request.url));
			if ('range' in request.headers) {
				return new Media(request.url).__send__(request, response);
			}
			return new File(request.url).__send__(request, response);
		}
		catch (e) {
			return this.__err__(404, e, request, response);
		}

		// Request method mismatch, or method not supported:
		if (request.method.toUpperCase() !== route.method.toUpperCase() || (!(request.method.toUpperCase() in Router))) {
			return this.__err__(405, http.STATUS_CODES[405], request, response);
		}

		try {
			let actionResponse = await this[`__${request.method.toLowerCase()}__`](route, request, response);
			return this.__send__(actionResponse, request, response);
		}
		catch (e) {
			return this.__err__(500, e, request, response);
		}
	}

	// Handle the sending of a response:
	static async __send__ (actionResponse, request, response) {
		// No response, send a 204:
		if (!actionResponse) {
			response.writeHead(204);
			return response.end();
		}

		// Does the response have a 'send' method?
		if ('__send__' in actionResponse) try {
			return await actionResponse.__send__(request, response, this.settings);
		}
		catch (e) {
			actionResponse = new Error(e);
		}

		// Is the response an Error?
		if (actionResponse instanceof Error) return this.__err__(500, actionResponse.message, request, response);

		// Should we cache the response?
		const cKey = `Action::${request.url}`;
		if (response.cache && !(await rememberFromCache(cKey))) {
			storeInCache(cKey, actionResponse, this.settings.server.redis.defaultMaxAge);
		}

		// Is the response a Buffer?
		if (actionResponse instanceof Buffer) {
			if ('range' in request.headers) {
				return new Media(actionResponse).__send__(request, response);
			}
			response.writeHead(response.statusCode, { 'Content-Type': filetype(actionResponse).mime });
			return response.end(actionResponse);
		}

		// Is the response a string or a number?
		if (typeof actionResponse === 'string' || typeof actionResponse === 'number') {
			return new DataString('text/plain', actionResponse).__send__(request, response);
		}

		// None of the above? Attempt to send as JSON
		try {
			return new DataString('application/json', JSON.stringify(actionResponse)).__send__(request, response);
		}
		catch (e) {
			return this.__err__(500, e, request, response);
		}
	}

	// Internal Error handler:
	static async __err__ (code, error, request, response) {
		log('error', code, request.url);
		response.statusCode = Number(code) || 500;

		if (this.settings.debug) console.error(code, error);

		try {
			const actionResponse = await this.__get__(http.routes[`/error/${code}`], request, response);
			this.__send__(actionResponse, request, response);
		}
		catch (e) {
			log('warning', 404, `/error/${code}`);
			return response.end(`${code} Error - ${error || http.STATUS_CODES[code]}`);
		}
	}

	// Internal GET request handler:
	static async __get__ (route, request, response) {
		const controller = route.controller;
		const action = controller[route.action];
		const data = [];

		request.session = await Session.findSession(request, response);
		request.controller = controller;
		request.query = route.data.__query__;
		delete route.data.__query__;

		// If action or controller has the @EnableCORS annotation:
		if ('__cors__' in controller) response.setHeader('Access-Control-Allow-Origin', controller.__cors__);
		if ('__cors__' in action) response.setHeader('Access-Control-Allow-Origin', action.__cors__);

		// Check requirements/authorization:
		if ('requirements' in action) for (let requirement of action.requirements) {
			if (!(await requirement(request, response))) return this.__err__(401, http.STATUS_CODES[401], request, response);
		}

		// Check if there's a cached verion of the action:
		if ('__cache__' in action && action.__cache__.enabled) {
			response.cache = true;

			if ('client' in this.settings && 'cache' in this.settings.client && this.settings.client.cache.enabled) {
				response.setHeader('Cache-Control', `
					public, max-age=${(this.settings.client.cache.defaultMaxAge * 1000) || 1000}`
				);
			}

			const cached = await rememberFromCache(`Action::${request.url}`);
			if (cached) return cached;
		}

		// Turn data into an aray, and then spread it as arguments for the action:
		for (let key in route.data) data.push(route.data[key]);

		return await action(...data, request, response);
	}

	// Internal POST request handler (uses get handler after end event):
	static async __post__ (route, request, response) {
		return new Promise((resolve, reject) => {
			let body = new Buffer([]);
			request.on('error', e => reject(e));
			request.on('data', x => { body = Buffer.concat([body, x]) });
			request.on('end', x => {
				request.body = body;
				resolve(this.__get__(route, request, response));
			});
		});
	}

	// Internal PUT request handler (uses post handler):
	static async __put__ (route, request, response) {
		return this.__post__(route, request, response);
	}
}

if (!Blackbeard.ready) Blackbeard.__setup__();