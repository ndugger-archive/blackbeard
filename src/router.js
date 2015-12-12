import http from 'http';
import path from 'path';

export const GET = 'GET';
export const POST = 'POST';
export const PUT = 'PUT';

export default class Router {

	//static CONNECT = 'CONNECT';
	//static DELETE = 'DELETE';
	static GET = GET;
	//static HEAD = 'HEAD';
	static POST = POST;
	static PUT = PUT;
	//static TRACE = 'TRACE';

	// To be used as a decorator/annotation on class methods:
	static MapRoute (url = '/', method = Router.GET) {
		const routes = http.routes;

		// Allow trailing slash to be optional:
		url = url.replace(/\/$/, '') || '/';

		// Return the real decorator:
		return (controller, action, descriptor) => {

			// Mapping an action:
			if (action) {
				if (url in routes) url = `dupe:${url}`;

				routes[url] = { action, controller, method };

				descriptor.value.controller = controller;
				return descriptor;
			}
			// Mapping a controller:
			else {
				const reRoutes = {};

				// Modify routes to include controller's url:
				for (let route in routes) {
					const routeControllerName = routes[route].controller.constructor.name;

					if (routeControllerName === controller.name) {
						const newRoute = path.join(url, route.replace(/dupe:/, ''));
						if (newRoute in routes) throw new TypeError(`Route already exists for ${newRoute}`);
						reRoutes[newRoute] = routes[route];
					} else {
						reRoutes[route] = routes[route];
					}
				}

				http.routes = reRoutes;

				return controller;
			}
		}
	}

	// Compare a URL to our collection of routes:
	static find (url) {
		const routes = http.routes;

		// Will hold the found route:
		let found;

		// The address query string:
		const query = url.split('?')[1];

		// Allow trailing slash to be optional:
		url = url.split('?')[0].replace(/\/$/, '') || '/';

		// Regex to find variables in route:
		const pattern = /\{(.*)\}/;

		// Loop through all routes to match against url:
		for (let route in routes) {

			// Allow trailing slash to be optional:
			route = route.replace(/\/$/, '') || '/';

			// Collection of discovered variables:
			let vars = {};

			// Route has no variables:
			if (route === url) {
				found = routes[route];
			}

			// Route contains variables:
			if (route.match(pattern)) {

				// Route is compatable:
				if (route.split('/').length === url.split('/').length) {

					// Keep track of the index:
					let i = 0;

					// split route on each dir, then loop:
					for (let dir of route.split('/')) {

						if (dir.match(pattern)) {
							vars[dir.match(pattern)[1]] = url.split('/')[i++];
						} else if (dir === url.split('/')[i++]) {
							continue;
						} else {
							vars = {};
							break;
						}
					}

					// Found correct route:
					if (Object.keys(vars).length) {
						found = routes[route];
					}
				}
			}

			if (!found) continue;

			// Add query vars to route:
			if (query) {
				vars.__query__ = {};
				query.split('&').forEach(set => {
					const key = set.split('=')[0];
					const value = set.split('=')[1];
					vars.__query__[key] = value;
				});
			}

			// Add the vars to the route as 'data':
			found.data = vars;

			return found;
		}
	}
}