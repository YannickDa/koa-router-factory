import Router from "koa-router";

const parseRoute = (name, config, parentController) => {
  const router = new Router();

  let method = "get";
  if (config.method) {
    if (["get", "put", "post", "patch", "delete", "all"].indexOf(config.method) === -1) {
      throw new Error(`method ${config.method} is not supported for route ${name}`);
    }

    method = config.method
  }

  const controller = config.controller ? config.controller:parentController;
  if (!controller) {
    throw new Error(`Missing controller for ${name} route`);
  }

  const action = config.action ? config.action:"index";

  if (!controller[action]) {
    throw new Error(`Missing action ${action} for ${name} route`);
  }

  router[method].call(router, name, config.url, async ctx => await controller[action].call(ctx));

  if (config.childs) {
    Object.keys(config.childs).forEach(key => {
      const childRouter = parseRoute(`${name}-${key}`, config.childs[key], controller);
      router.use(config.url, childRouter.routes(), childRouter.allowedMethods());
    });
  }

  return router;
};

export default routes => {
  const router = new Router();

  Object.keys(routes).forEach(key => {
    const childRouter = parseRoute(key, routes[key]);
    router.use("", childRouter.routes(), childRouter.allowedMethods());
  });

  return router;
};
