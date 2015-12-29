#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const prompt = require('prompt');

const command = process.argv.pop().toLowerCase();

const gulpFile = `const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('js:transpile', function () {
	gulp.src('./src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({ stage: 0, optional: ['runtime'] }))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('views:migrate', function () {
	gulp.src('./src/views/**/*.marko')
		.pipe(gulp.dest('./dist/views/'))
});

gulp.task('styles:minify', function () {
	gulp.src('./src/public/**/*.css')
		.pipe(uglify())
		.pipe(gulp.dest('./dist/public/'));
});

gulp.task('images:migrate', function () {
	gulp.src('./src/public/**/*.+(png|jpe?g|gif)')
		.pipe(gulp.dest('./dist/public/'))
});

gulp.task('build', [
	'js:transpile', 
	'views:migrate', 
	'styles:minify', 
	'images:migrate'
]);

gulp.task('default', ['build']);`;

const boilerplateApp = `import './controllers/maincontroller';
import './controllers/errorcontroller';

import Blackbeard from 'blackbeard';
Blackbeard.start();`;

const boilerplateController = `import { Controller, DataString, Router, View } from 'blackbeard';
const { MapRoute, GET, POST } = Router;

@Controller
class MainController {

	@MapRoute('/', GET)
	async index () {
		return new View('index');
	}

	@MapRoute('/{foo}', GET)
	async foo (foo) {
		return new View('foo', { foo });
	}

	@MapRoute('/foo/bar', POST)
	async bar (request) {
		const data = JSON.parse(request.body.toString());
		console.log(data);
		return new DataString('application/json', JSON.stringify({
			success: true,
			hello: 'world'
		}));
	}

}`;

const boilerplateErrorController = `import { Controller, Router } from 'blackbeard';
const { MapRoute, GET } = Router;

@Controller
@MapRoute('/error')
class ErrorController {

	@MapRoute('/404', GET)
	async notFound () {
		return 'Jedi Mind Trick 404 - This is not the page you\\'re looking for';
	}

}`;

const boilerplateModel = `import { Model, Schema } from 'blackbeard';
const { Integer, String, Text } = Schema;

@Model
export default class User {
	name = String;
	age = Integer;
	bio = Text;
}`;

const boilerplateMasterView = `<!doctype html>
<html>
	<head>
		<title>My Project</title>
		<script src='https://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.22/require.min.js'></script>
	</head>
	<body>
		<layout-placeholder name='body'/>
	</body>
</html>`;

const boilerplateMainIndex = `<layout-use template='../master.marko'>
	<layout-put into='body'><h1>This is my home page!</h1></layout-put>
</layout-use>`;

const boilerplateMainFoo = `<layout-use template='../master.marko'>
	<layout-put into='body'><h1>foo: ${'${data.foo}'}</h1></layout-put>
</layout-use>`;

(function () { switch (command) {

	case 'setup': {
		const initial = {
			boilerplate: {
				description: 'Include basic boilerplate?',
				pattern: /(y(es)?|no?)$/,
				message: '"yes" or "no"',
				default: 'yes'
			},

			debugMode: {
				description: 'Run Blackbeard in debug mode?',
				pattern: /(y(es)?|no?)$/,
				message: '"yes" or "no"',
				default: 'no'
			},

			serverPort: {
				description: 'The port on which to run Blackbeard',
				default: 80
			},

			clientCache: {
				description: 'Client-side caching? Set the cache\'s max-age in seconds',
				default: 60
			},

			redis: {
				description: 'Use redis? (required for server caching and built-in sessions)',
				pattern: /(y(es)?|no?)$/,
				message: '"yes" or "no"',
				default: 'yes'
			}
		};
		const redis = {
			defaultMaxAge: {
				description: 'The default max-age for cache entries (in seconds)',
				default: 0
			},
			host: {
				description: 'Domain/IP in which Redis resides',
				default: 'localhost'
			},
			port: {
				description: 'Port in which Redis resides',
				default: 6379
			},
			username: {
				description: 'Login username for Redis (leave blank for none)'
			},
			password: {
				description: 'Login password for Redis (leave blank for none)'
			}
		};
		const dbInitial = {
			database: {
				description: 'Use a database? [postgres, mysql, mariadb, sqlite, mssql]',
				pattern: /none|(postgres|mysql|mariadb|sqlite|mssql)$/,
				message: 'Must be one of the following: none, postgres, mysql, mariadb, sqlite, mssql',
				default: 'none'
			}
		};
		const database = {
			domain: {
				description: 'Domain/IP in which your database resides',
				default: 'localhost'
			},

			port: {
				description: 'Port on which your database resides',
				default: 80
			},

			database: {
				description: 'Name of your database',
				default: 'database'
			},

			username: {
				description: 'Login username for your database',
				default: 'admin'
			},

			password: {
				description: 'Login password for your database',
				default: 'password'
			}
		};
		const config = {};
		const saveConfig = function () {
			fs.writeFile(path.join(process.cwd(), 'blackbeard.config'), JSON.stringify(config, null, 2), 'utf8', function (error) {
				if (error) console.error(error);
			});
		};
			
		prompt.message = 'Blackbeard Setup';

		// Create the "gulpfile.js":
		return new Promise(function (resolve) {
			fs.writeFile(path.join(process.cwd(), 'gulpfile.js'), gulpFile, 'utf8', function (error) {
				if (error) console.log(error.message);
				resolve();
			});
		})
		// Create the "src" folder:
		.then(function () {
			return new Promise(function (resolve) {
				fs.mkdir(path.join(process.cwd(), 'src'), function (error) {
					if (error) console.log(error.message);
					resolve();
				});
			});
		})
		// Create the MVC structure:
		.then(function () {
			return Promise.all(['controllers', 'models', 'views', 'public'].map(function (dir) {
				return new Promise(function (resolve) {
					fs.mkdir(path.join(process.cwd(), 'src', dir), function (error) {
						if (error) console.log(error.message);
						resolve();
					});
				});
			}));
		})
		// Start prompting the user for configuration:
		.then(function () {
			console.log();
			prompt.get({ properties: initial }, function (error, initial) {

				if (error) return console.error(error);

				config.debug = Boolean(initial.debugMode.match(/y(es)?/));
				config.server = {
					port: initial.serverPort,
					redis: {
						enabled: Boolean(initial.redis.match(/y(es)?/))
					}
				};
				config.client = {
					cache: {
						enabled: Number(initial.clientCache) > 0,
						defaultMaxAge: Number(initial.clientCache) || 0
					}
				};

				// Should we create the 'boilerplate' files?
				if (initial.boilerplate.match(/y(es)?/)) {
					const src = path.join(process.cwd(), 'src');
					// Add the appe ntry point file:
					new Promise(function (resolve) {
						fs.writeFile(path.join(src, 'app.js'), boilerplateApp, 'utf8', function () {
							resolve();
						});
					})
					// Add the MainController file:
					.then(function () {
						return new Promise(function (resolve) {
							fs.writeFile(path.join(src, 'controllers', 'maincontroller.js'), boilerplateController, 'utf8', function () {
								resolve();
							});
						});
					})
					// Add the ErrorController file:
					.then(function () {
						return new Promise(function (resolve) {
							fs.writeFile(path.join(src, 'controllers', 'errorcontroller.js'), boilerplateErrorController, 'utf8', function () {
								resolve();
							});
						});
					})
					// Add the User modelm file:
					.then(function () {
						return new Promise(function (resolve) {
							fs.writeFile(path.join(src, 'models', 'user.js'), boilerplateModel, 'utf8', function () {
								resolve();
							});
						});
					})
					// Add the Master template file:
					.then(function () {
						return new Promise(function (resolve) {
							fs.writeFile(path.join(src, 'views', 'master.marko'), boilerplateMasterView, 'utf8', function () {
								resolve();
							});
						});
					})
					// Add the viws/main folder:
					.then(function () {
						return new Promise(function (resolve) {
							fs.mkdir(path.join(src, 'views', 'main'), function () {
								resolve();
							});
						});
					})
					// Add the Main Index file:
					.then(function () {
						return new Promise(function (resolve) {
							fs.writeFile(path.join(src, 'views', 'main', 'index.marko'), boilerplateMainIndex, 'utf8', function () {
								resolve();
							});
						});
					})
					// Add the Main Foo file:
					.then(function () {
						return new Promise(function (resolve) {
							fs.writeFile(path.join(src, 'views', 'main', 'foo.marko'), boilerplateMainFoo, 'utf8', function () {
								resolve();
							});
						});
					})
					.catch(function (error) { console.error(error) });
				}

				if (config.server.redis.enabled) {
					prompt.get({ properties: redis }, function (error, redis) {
						config.server.redis.defaultMaxAge = Number(redis.defaultMaxAge) || 0;
						config.server.redis.host = redis.host;
						config.server.redis.port = redis.port;
						config.server.redis.username = redis.username;
						config.server.redis.password = redis.password;

						prompt.get({ properties: dbInitial }, function (error, db) {
							if (db.database !== 'none') {
								prompt.get({ properties: database }, function (error, database) {
									config.database = database;
									config.database.engine = db.database;
									saveConfig();
								});
							}
							else {
								saveConfig();
							}
						});
					});
				}
				else {
					prompt.get({ properties: dbInitial }, function (error, db) {
						if (db.database !== 'none') {
							prompt.get({ properties: database }, function (error, database) {
								config.database = database;
								config.database.engine = db.database;
								saveConfig();
							});
						}
						else {
							saveConfig();
						}
					});
				}

			});
		});

		prompt.start();
	}

	default: {
		console.error('Unknown command:', command);
	}

} })();