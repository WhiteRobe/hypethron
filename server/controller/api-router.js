const KoaRouter = require('koa-router');
const koaBody = require('koa-body'); // @See https://www.npmjs.com/package/koa-body
const chalk = require('chalk');

/**
 * Method enum.
 * @type {string}
 */
const METHOD_GET = "GET";
// const METHOD_HEAD = "HEAD"; // Currently not support
const METHOD_DELETE = "DELETE";
const METHOD_POST = "POST";
const METHOD_PUT = "PUT";
const METHOD_PATCH = "PATCH";

/**
 * All of the service(RESTful-api) register to this router,
 * will expose to path: '/api/*'
 */
const apiRouter = KoaRouter();


/**
 * The router table, any service list on this table,
 * will be register to $apiRouter.
 *
 *  - When you use/call GET|HEAD|DELETE, use $ctx.query to get your parameters
 *  - When you use/call POST|PUT|PATCH,  use $ctx.body to get your parameters
 */
const API_ROUTER_TABLE = {
  "/apiExample": {
    methods: [METHOD_GET, METHOD_POST],
    service: async (ctx, next) => {
      console.log("/api/apiExample body", ctx.request.body);
      console.log("/api/apiExample query", ctx.request.query);
      ctx.body = ctx.request.body ? ctx.request.body : ctx.request.query;
      return next();
    }
  }
};


/**
 * You can also register the service manually like these:
 * - when you use/call POST|PUT|PATCH, you need to inject koa-body
 */
/*
apiRouter.get("/apiTest", async(ctx, next) => {
  console.log("/api/apiTest get", ctx.request.body);
  console.log("/api/apiTest get", ctx.request.query);
  ctx.response.body = JSON.stringify(ctx.request.query);
  return next();
});

apiRouter.post("/apiTest", koaBody(), async (ctx, next) => {
  console.log("/api/apiTest post", ctx.request.body);
  console.log("/api/apiTest post", ctx.request.query);
  ctx.response.body = JSON.stringify(ctx.request.body);
  return next();
});
*/


//---------------Do not modify codes below---------------//

/**
 * Register all the service listed on $API_ROUTER_TABLE to $apiRouter.
 */
(async function () {
  for (let i in API_ROUTER_TABLE) {
    let service = API_ROUTER_TABLE[i].service;
    await API_ROUTER_TABLE[i].methods
      .filter((item, index, self) => self.indexOf(item) === index)
      .forEach(
        (method) => registerAnService(i, method, service)
      );
  }
})();


/**
 * 注册一个服务
 * @param path 地址 (相对于 /api )
 * @param method HTTP 方法
 * @param service 服务 (异步)
 */
function registerAnService(path, method, service) {
  switch (method) {
    case METHOD_GET:
      apiRouter.get(path, service);
      break;
    /*case METHOD_HEAD:
      apiRouter.head(i, service);
      break;*/
    case METHOD_DELETE:
      apiRouter.del(path, service);
      break;
    case METHOD_POST:
      apiRouter.post(path, koaBody(), service);
      break;
    case METHOD_PUT:
      apiRouter.put(path, koaBody(), service);
      break;
    case METHOD_PATCH:
      apiRouter.patch(path, koaBody(), service);
      break;
    default:
      console.error(chalk.red("api-router.js: Error/Unknown HTTP Method!"));
      process.exit(10);
  }
}

module.exports = apiRouter;
