import CookieJar from 'cookies';

import DataString from './datastring';
import { rememberFromCache, storeInCache, forgetCachedItem } from './cache';

export default class Session {

	static cookie = 'blackbeard:session:id';

	static async isAuthenticated (request, response) {
		const cookies = new CookieJar(request, response);
		const sessionId = cookies.get(Session.cookie);
		return sessionId ? true : false;
	}

	static async findSession (request, response) {
		return new Promise(async resolve => {
			const cookies = new CookieJar(request, response);
			const sessionId = cookies.get(Session.cookie);
			const session = await rememberFromCache(`Session::${sessionId}`);
			resolve(session);
		});
	}

	static async endSession (request, response) {

	}

	constructor (data) {
		this.data = data;
		this.id = btoa(Date.now() * Math.random()) + btoa(Date.now() / Math.random());
	}

	async save (request, response) {
		const cookies = new CookieJar(request, response);
		const maxAge = 60 * 60 * 24 * 14;

		try {
			cookies.set(Session.cookie, this.id, { maxAge: maxAge * 1000 });
			await storeInCache(`Session::${this.id}`, this.data, maxAge);
		} catch (e) {
			console.error(e);
		}
	}

	async __send__ (request, response) {
		const session = new DataString('application/json', JSON.stringify(this.data));
		session.__send__(request, response);
		this.save(request, response);
	}

}