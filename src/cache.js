import http from 'http';

export const storeInCache = (key, value, maxAge = 0) => {
	try {
		if (http.cache && value) {
			http.cache.set(key, JSON.stringify(value));
			http.cache.expire(key, maxAge);
		}
		return Promise.resolve(value);
	} catch (e) {
		console.error(e);
	}
}

export const rememberFromCache = key => {
	return new Promise(resolve => {
		http.cache.get(key, (error, result) => {
			if (error) reject(error);
			if (result) {
				try {
					result = JSON.parse(result);
					if (result.content && result.content.data && result.content.type === 'Buffer') {
						result.content = new Buffer(result.content.data);
					}
					resolve(result);
				}
				catch (e) {
					resolve(result);
				}
			}
			else {
				resolve(null);
			}
		})
	});
}

export const forgetCachedItem = key => {
	return new Promise(resolve => {
		if (key instanceof String) {
			http.cache.del(key);
			resolve();
		}
		if (key instanceof Function && 'controller' in key) {
			key = new RegExp(`Action::${key.controller.constructor.name}.${key.name}`);
		}
		if (key instanceof RegExp) {
			http.cache.keys('*', (error, keys) => {
				keys.forEach(k => {
					if (k.match(key)) {
						http.cache.del(k);
					}
				});
				resolve();
			});	
		}
	});
}

// @Cache annotation:
export default (seconds, a, b) => {

	// Allow using of the annotation without passing in a seconds value:
	if (seconds && typeof seconds !== 'number') {
		const object = seconds;
		const action = a;
		const descriptor = b;
		seconds = http.cache ? http.cache.defaultMaxAge : 0;

		if (action && descriptor) {
			descriptor.value.__cache__ = {
				enabled: true,
				maxAge: seconds
			};
			return descriptor;
		}

		if (global.database && object instanceof global.database.Model) {
			object.__cache__ = {
				enabled: true,
				maxAge: seconds
			}
		}

		return object;
	}

	return (object, action, descriptor) => {

		if (action) {
			descriptor.value.__cache__ = {
				enabled: true,
				maxAge: seconds
			};
			return descriptor;
		}

		if (global.database && object instanceof global.database.Model) {
			object.__cache__ = {
				enabled: true,
				maxAge: seconds
			};
		}

		return object;
	}

}