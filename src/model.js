import http from 'http';

import {storeInCache, rememberFromCache, forgetCachedItem} from './cache';

function overwrite (name, remember) {
	return function (x) {
		const model = this;
		const cache = model.__cache__;
		const original = this::this.__proto__[name];

		if (!cache && !cache.enabled) {
			return Promise.resolve(original(...arguments));
		}

		return new Promise(async resolve => {
			let key = `Model::${model.name}`;
			let maxAge = cache.maxAge;
			if (remember) {
				key += x ? JSON.stringify(arguments) : '';
				const cached = await rememberFromCache(key);
				if (cached) {
					resolve(cached)
				} else {
					resolve(original(...arguments).then(results => storeInCache(key, results, maxAge)));
				}
			} else {
				resolve(forgetCachedItem(new RegExp(key)).then(original(...arguments)));
			}
		});
	}
}

// Model annotation
export default model => {

	if (global.database) {

		global.database.define(model.name, new model, {

			// Overwrite methods to enable caching/invalidation on models:
			classMethods: http.cache ? {

				// Find:
				all: overwrite('all', true),
				findAll: overwrite('findAll', true),
				findOne: overwrite('findOne', true),
				findById: overwrite('findById', true),
				findOrCreate: overwrite('findOrCreate', true),
				findCreateFind: overwrite('findCreateFind', true),
				findAndCountAll: overwrite('findAndCountAll', true),
				count: overwrite('count', true),
				max: overwrite('max', true),
				min: overwrite('min', true),
				sum: overwrite('sum', true),
				aggregate: overwrite('aggregate', true),

				// Create:
				create: overwrite('create'),
				bulkCreate: overwrite('bulkCreate'),
				update: overwrite('update'),
				upsert: overwrite('upsert'),
				truncate: overwrite('truncate'),
				drop: overwrite('drop'),
				destroy: overwrite('destroy'),
				restore: overwrite('restore')
				
			} : {}
		});

		global.database.sync();

		return global.database.models[model.name];
	}

	else {
		console.error('No database detected')
	}
}