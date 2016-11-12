import http from "http";
import supertest from "supertest";
import { expect } from "chai";

import Koa from "koa";
import routerFactory from "../src";

const testController = {
  index: (async function () {
    this.body = "index action";
  }),
  testAction: (async function () {
    this.body = "test action";
  })
};

const createApp = router => {
  const app = new Koa();
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};

const request = app => supertest(http.createServer(app.callback()));

describe("Router Factory", () => {
  it("Can create basic route", done => {
    const router = routerFactory({
      index: {
        url: "/index",
        controller: testController,
        action: "testAction"
      }
    });

    const app = createApp(router);

    request(app)
      .get("/index")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).equal("test action");
        done();
      });
  });

  it("Can't create route with a HTTP verb not get, put, post or path", () => {
    const routes = {
      index: {
        url: "/index",
        controller: testController,
        action: "testAction",
        method: "unknow"
      }
    };

    expect(() => routerFactory(routes)).to.throw(Error, "method unknow is not supported for route index");
  });

  it("Can create route for a particular HTTP verb", done => {
    const router = routerFactory({
      index: {
        url: "/index",
        controller: testController,
        method: "put",
        action: "testAction"
      }
    });

    const app = createApp(router);

    request(app)
      .put("/index")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).equal("test action");

        request(app)
          .get("/index")
          .expect(405)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.text).equal("Method Not Allowed");
            done();
          });
      });
  });

  it("Can create route with no action. Index action is used as default", done => {
    const router = routerFactory({
      index: {
        url: "/index",
        controller: testController
      }
    });

    const app = createApp(router);

    request(app)
      .get("/index")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).equal("index action");
        done();
      });
  });

  it("Can't create route with an action not defined", () => {
    const routes = {
      index: {
        url: "/index",
        controller: testController,
        action: "unknowAction"
      }
    };

    expect(() => routerFactory(routes)).to.throw(Error, "Missing action unknowAction for index route");
  });

  it("Can't create route without controller", () => {
    const routes = {
      index: {
        url: "/index"
      }
    };

    expect(() => routerFactory(routes)).to.throw(Error, "Missing controller for index route");
  });

  it("Can create child route", done => {
    const router = routerFactory({
      index: {
        url: "/index",
        controller: testController,
        childs: {
          test: {
            url: "/test",
            action: "testAction"
          }
        }
      }
    });

    const app = createApp(router);

    expect(router.url("index-test")).equal("/index/test");

    request(app)
      .get("/index")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).equal("index action");

        request(app)
          .get("/index/test")
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.text).equal("test action");
            done();
          });
      });
  });
});
