const Router = require("koa-router");

const parseRoute = (name, config, parentController) => {
  const router = new Router();

  let methods = ["get"];
  if (config.method) {
    if (!(config.method instanceof Array)) {
      config.method = [config.method];
    }

    config.method.forEach(method => {
      if (["get", "put", "post", "patch", "delete", "all"].indexOf(method) === -1) {
        throw new Error(`method ${method} is not supported for route ${name}`);
      }
    });

    methods = config.method
  }

  const controller = config.controller ? config.controller:parentController;
  if (!controller) {
    throw new Error(`Missing controller for ${name} route`);
  }

  let action;
  if (typeof controller === "object") {
    action = config.action ? config.action:"index";
    if (!controller[action]) {
      throw new Error(`Missing action ${action} for ${name} route`);
    }
  }

  const actionCaller = action ? controller[action]:controller;

  methods.forEach(method => {
    router[method].call(router, name, config.url, ctx => actionCaller.call(ctx));
  });

  if (config.childs) {
    Object.keys(config.childs).forEach(key => {
      const childRouter = parseRoute(`${name}-${key}`, config.childs[key], controller);
      router.use(config.url, childRouter.routes(), childRouter.allowedMethods());
    });
  }

  return router;
};

module.exports = function (routes) {
  const router = new Router();

  Object.keys(routes).forEach(key => {
    const childRouter = parseRoute(key, routes[key]);
    router.use("", childRouter.routes(), childRouter.allowedMethods());
  });

  return router;
};
