*Although getting close, Blackbeard is not ready for use, yet. It will be once it reaches v0.1.0-beta*

Blackbeard
==========
**Simple, powerful, familiar**

Blackbeard is an MVC framework for Node.js, designed to be familar.

Using Redis (*for caching*), Sequelize (*for models/ORM*), and Passport (*for user authentication*), Blackbeard offers a complete solution for developing Node.js applications.

Installation
------------

`npm install blackbeard --save`

Example Usage
-------------

Designed to be used with modern (and future) javascript, you will probably need a build process for your code in order to ensure that Blackbeard works.

**app.js**
```javascript
import Blackbeard from 'blackbeard';
import './controllers/maincontroller';

Blackbeard.start();
```

---

**models/user.js**

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

**controllers/maincontroller.js**
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
		return new Promise((resolve, reject) => {
			try {
				const users = await User.findAll();
				resolve(new View('index', { users }));
			} catch (e) {
				console.error(e);
				resolve(null);
			}	
		});
	}

	@MapRoute('/foo/{bar}', Router.GET)
	async foo (bar, request, response) {
		// ...
	}

	@MapRoute('/foo/{bar}/{baz}', Router.POST)
	async whatever (bar, baz, request, response) {
		// posted data accessible via request.body
	}

}
```

---

**views/main/index.ejs**

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

(Licensed under MIT)