# Quickstart
- First, create or generate a **package.json** file (```npm init```)
- Then run ```npm install blackbeard --save```
- Next, add ```"blackbeard": "blackbeard"``` to your **package.json**'s scripts property
- Finally, run ```npm run blackbeard setup```

It is **highly recommended** that you allow the setup to generate some boilerplate code for you. This is the best way to understand and see how the API works.

**Requirements:**
- Node >= 4.x
- NPM >= 3.x

***

# What is Blackbeard?
Blackbeard is a heavily opinionated MVC framework. It was designed to be familar and simple, yet fast and powerful. If you're familiar with .NET MVC or Spring framework, then you should be able to pick up Blackbeard's API pretty quickly.

# Why Blackbeard?
Most other popular frameworks are great (they're popular for a reason), but JavaScript has evolved very quickly, as of late, and the other frameworks' APIs do not match the new language features. Blackbeard's goal is to be a great framework, but to also use modern and future JavaScript syntax in order to maximize readability and RAD capabilities.

**Features:**
- Models (via sequelize)
- Views (default via Marko)
- Controllers
- Routing
- Sessions and Caching (via Redis)
- Easy API via Annotations/ Class decorators
- Built-in Error re-routing/ messaging
- Simple API for making external requests
- Very easy to make a RESTful JSON api

***

## Installation

**Requirements:**
- Node >= 4.x
- NPM >= 3.x

Make sure to have a **package.json** file before installing Blackbeard (```npm init```)

You can install Blackbeard via NPM: **```npm install blackbeard --save```**

Once Blackbeard, and all of its dependencies have been downloaded, you're going to want to open your **package.json** file.

In your package file, add a script, like so:

```"scripts": {
  "blackbeard": "blackbeard"
},```

This links the locally installed ```blackbeard``` command to your npm package file for convenience.

## Setup
Once you've installed Blackbeard, and have added the "blackbeard" command to your package file, you're going to want to run **```npm run blackbeard setup```** in your command shell.

You will then be prompted for some configuration options. It will set up your folder structure, and if you choose to generate some boilerplate code (which is highly recommended that you do so), it will write out some example code for you as well.

The setup script will also create a **gulpfile.js** for you. When you are ready to build/transpile your code (via babel), just run **``gulp build``**.

If you choose to use a database (via Sequelize), then you will need to install the apropriate modules as well. If you're unsure of what modules you'll need, Sequelize will throw an error that will tell you which modules that you're mising. Future versions of Blackbeard will automatically install these for you upon setup.

## Examples
**The best way to learn would be to run the setup script, and include the boilerplate code**. It will generate examples for you that you can build off of.

**Example entry point:**
```javascript
import './controllers/maincontroller'
import './controllers/advancedcontroller';

import './models/user';
import './models/comment';

import Blackbeard from 'blackbeard';
Blackbeard.start();
```
The entry point will register all of your controllers and models, and then start the server.

Most of the API is comprised of class annotations/decorators. The best way to describe this is to simply show you, so here's an example of a very simple controller

### Controllers
```javascript
import { Controller, Router, View } from 'blackbeard';
const { MapRoute, GET } = Router;

@Controller
class MainController {

    @MapRoute('/', GET)
    async index () {
        return new View('index'); // the server will find the view at "views/main/index.marko"
    }

}
```

Now, that's obviously very simple--what about dealing with more complex routing?

```javascript
import { Controller, Router, View } from 'blackbeard';
const { MapRoute, GET } = Router;

@Controller
@MapRoute('/advanced')
class AdvancedController {

    @MapRoute('/foo/{bar}', GET)
    async index (bar) {
        return new View('index', { bar }); // the server will find the view at "views/advanced/index.marko"
    }

}
```

What exactly did we do? Well, now the Controller has a route; that means that all actions within it will now be accessable via ```/advanced/<the action's route>```. This means that you can reach the index method by navigating to ```/advanced/foo/<whatever>```. You can guess that ```{something}``` denotes a variable path, so the ```bar``` argument will be set to whatever that path is that was navigated to.

Well, that's great, but what about a POST request?

```javascript
@MapRoute('/foo', POST)
async foo (request) {
    const data = request.body.toString();
}
```

Every action is also passed the request and response objects--you can access posted data via ```request.body```, but it will be a ```Buffer```, so turn it into a string if you need to (like if you posted some JSON).

Here's a list of all of the things that are supported by default to return from an action:
- ```new DataString(mimeType, string)```
- ```new File(pathOrBuffer)```
- ```new Media(pathOrBuffer)```
- ```new View(path)```

Blackbeard also handles returning of Error, Buffer, strings and numbers, and will try to JSON Stringify other Objects.

If an action throws an error, or if an error happens while trying to respond, Blackbeard will look for ```/error/<code>``` routes, and send those actions instead. If no route exists for that error code, it will just respond with text. If you'd like to show a custom page for an error, simply create a route for that error code in an ```ErrorController```

### Models
Models are also described using a class annotation, and besides using modern JavaScript syntax, they are [Sequelize Models](http://docs.sequelizejs.com/en/latest/docs/models-definition/), and can be defined in a *very* similar manner.

```javascript
import { Model, Schema } from 'blackbeard';
const { String, Integer, Text } = Schema;

@Model
export default class User {
    name = String;
    age = Integer;
    bio = Text;
}
```

Once it comes time to use the Model in one of your controllers, the API has not changed from the original [Sequelize Model Usage](http://docs.sequelizejs.com/en/latest/docs/models-usage/).

**Here's a list of supported Schema types:**
- String
- Binary
- Text
- Integer
- BigInt
- Float
- Real
- Double
- Decimal
- Date
- Boolean
- Enum
- Array
- JSON
- JSONB
- Blob
- UUID

### Views
There's not much to document here, but Blackbeard (by default) uses the [Marko](http://markojs.com/) templating engine, and you can learn about it by reading their documentation.

There are plans to support configuring which templating engine to use. It will be a part of the setup script.

## Annotations
As stated, most of the API is comprised of class annotations/decorators. Here's a list of them and how you can use them:

### ```@Cache```
- Used to Cache actions and Models (database queries)
- Can only be used if you enabled caching and are running Redis
- Will either use the maxAge in the config, or you may pass one in
```javascript
@Cache(30)
@Model
export default class User { ... }
```
```javascript
@Cache
async myAction () { ... }
```
***
### ```@Controller```
- Used to define a Controller on a class
```javascript
@Controller
class MainController { ... }
```
***
### ```@EnableCORS```
- Used to enable cross-orign-resource-sharing for that action
- Will either use "*" for the allowed origin, or you may pass one in
- Can be used on a Controller, or an action
```javascript
@Controller
@EnableCORS
class MainController { ... }
```
***
### ```@MapRoute```
- Access it on the ```Router``` object
- Takes a path and a request method
- Paths may contain variables (```{variable}```)
- Currently supports GET, POST, and PUT
- No duplicate routes are allowed; Blackbeard will throw an error
```javascript
@MapRoute('/my/path/{here}', GET)
async myAction (here) { ... }
```
***
### ```@Requirements```
- Can be used to set restrictions on an action
- Any passed in methods **must** return a Promise
- If any of the promises reject, the server responds with a 401
- Can either be a single promise, or an array of promises
```javascript
@MapRoute('/foo', GET)
@Requirements([myPromise, anotherPromise])
async foo () { ... }
```
## Sessions
Sessions are stored in Redis, so if you want to use the built-in session handling, you'll need to be running a redis server.

Actions may either return a ```Session``` object, which will send as JSON, or you may simply use the ```Session``` object in your action, and use its ```save(request, response)``` method. This will create a key, which will be saved in a cookie, and will store the actual session data in Redis. The data that is store in the session is entirely up to you.

```javascript
async myAction (request, response) {
    const session = new Session({
        name: 'UserName',
        id: 1,
        role: 'Admin'
    });
    await session.save(request, response);
}
```

If you use the built-in Session management, every View will be passed 2 values.
- ```data.authenticated```: This is a boolean flag
- ```data.session```: This is the actual session (contains the data that you passed into the ```Session```.