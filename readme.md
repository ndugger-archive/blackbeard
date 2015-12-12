*Although getting close, Blackbeard is not ready for use, yet. It will be once it reaches v0.1.0-beta*

Blackbeard
==========
**Simple, powerful, familiar**

Blackbeard is an opinionated MVC framework for Node.js, designed to be familar.

Using Redis (*for caching*), Sequelize (*for models/ORM*), and Passport (*for user authentication*), Blackbeard offers a complete solution for developing Node.js applications.

Blackboard currently only supports [Marko](https://www.npmjs.com/package/marko) for templating, but plans to support others are in the pipeline. Suggestions are welcome.

**Current version:** 0.0.10-alpha

- [Installation](#installation)
- [Example usage](#example-usage)
- [Known bugs](#known-bugs)
- [TODO](#todo)

Installation
------------

`npm install blackbeard --save`

If you want to use caching (and user sessions), you will need to install the redis server from [redis.io](http://redis.io/). 

If you'd like to use a database with sequelize, you'll have to install the appropriate modules (pg, mysql, etc).

More in-depth installation instructions will be provided upon beta release.

Example Usage
-------------

Designed to be used with modern (and future) javascript, you will probably need a build process for your code in order to ensure that Blackbeard works. v0.1.0-beta will ship with a pre-built gulp file that will transpile your code for use.

Blackbeard looks for files in a dist/ folder; you will need to make sure to build into one.

**src/app.js**
```javascript
import Blackbeard from 'blackbeard';
import './controllers/maincontroller';

Blackbeard.start();
```

---

**src/models/user.js**

```javascript
import { Model, Schema } from 'blackbeard';

@Model
export default class User {
	name = Schema.Text;
	email = Schema.Text;
	age = Schema.Integer;
}
```

---

**src/controllers/maincontroller.js**
```javascript
import Blackbeard from 'blackbeard';
import User from '../models/user';

const Controller = Blackbeard.Controller;
const Router = Blackbeard.Router;
const MapRoute = Router.MapRoute;
const View = Blackbeard.View;

@Controller
export default class MainController {
	
	@MapRoute('/', Router.GET)
	async index (request, response) {
		try {
			const users = await User.findAll();
			return new View('index', { users });
		} catch (e) {
			console.error(e);
			return null;
		}
	}

	@MapRoute('/foo/{bar}', Router.GET)
	async foo (bar, request, response) {
		// ...
	}

	@MapRoute('/foo/{bar}/{baz}', Router.POST)
	async whatever (bar, baz, request, response) {
		// posted data accessible via `request.body`
	}

}
```

---

**src/views/main/index.marko**

```html
<!doctype html>
<html>
	<body>

		<div class='users'>

			<div class='user' for='user in data.users'>
				<b>${ user.name }</b>: ${ user.age }
			</div>

		</div>

	</body>
</html>
```

Known Bugs
----------
- Blackbeard.(post|request) does not work

Fixed Bugs
----------
- ~~Mapping a route on a controller does not work~~

TODO
----
- Analyze/refactor caching
- Reimplement action caching
- Convert cached Buffer to stream (if Media)
- Implement proper error logging
- Possibly add more annotations for convenience
- Build bin commands for setting up project
- More options in settings file for customizing project structure
- Possibly add support for swapping template engines

---

(Licensed under MIT)