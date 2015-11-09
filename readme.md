*Although getting close, Blackbeard is not ready for use, yet. It will be once it reaches v0.1.0-beta*

Blackbeard
==========
**Simple, powerful, familiar**

Blackbeard is an MVC framework for Node.js, designed to be familar.

Using Redis (*for caching*), Sequelize (*for models/ORM*), and Passport (*for user authentication*), Blackbeard offers a complete solution for developing Node.js applications.

**Current version:** 0.0.8-alpha

- [Installation](#install)
- [Example usage](#examples)
- [Known bugs](#bugs)
- [TODO](#todo)

Installation { #install }
-------------------------

`npm install blackbeard --save`

Example Usage { #examples }
---------------------------

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

**src/views/main/index.ejs**

```html
<!doctype html>
<html>
	<body>
		<div class='users'>
			<% users.forEach(user => { %>
				<div class='user'>
					<b><%- user.name %></b>: <%- user.age %>
				</div>
			<% }) %>
		</div>
	</body>
</html>
```

Known Bugs { #bugs }
--------------------

- Blackbear.(post|request) does not work
- Mapping a route on a controller does not work

TODO { #todo }
--------------

- Analyze/refactor caching
- Implement proper error logging
- Implement passport authenticaion/sessions
- Implement `requirements` annotation
- Possibly add more annotations for convenience
- Refactor layouts for global data (current user, etc)
- Build bin commands for setting up project
- Split up `blackbeard.js` into smaller parts
- More options in settings file for customizing project structure

---

(Licensed under MIT)