# koa-router-factory

> Factory for [koa-router 7.x](https://github.com/alexmingoia/koa-router)

* Crate koa-router with config
* Support nested routes

## Installation

Install using [npm](https://www.npmjs.org/):
```sh
npm install koa-router-factory
```

## Example ##
Basic usage :

```javascript
import Koa from "koa";
import routerFactory from "koa-router-factory";

const IndexController = {
  index: async function () {
    this.body = "index action";
  },

  secondAction: async function () {
    this.body = "second action";
  }
}

const app = new Koa();
const router = routerFactory({
  index: {
    url: "/",
    controller: IndexController,
    childs: {
      second: {
        url: "/second",
        action: "secondAction"
      }
    }
  }
});

app.use(router.routes())
   .use(router.allowedMethods());
```

## Config keys

| Key | Type | Description |
| ... | ... | ... |
| url | <code>String</code> | URL for the route |
| controller | <code>Object</code> | Object contains all actions needed. Is optional for child route. If not defined for child route, parent controller is used |
| action | <code>String</code> | If not specified, index action is used |
| childs | <code>Object</code> | Child routes definitions |
| method | <code>String</code> | get, post, put, delete, patch or all HTTP method. Default is get |


Context is binded to tha action call.

## Tests

Run test using `npm test`.
Run coverage using `npm run coverage`.
