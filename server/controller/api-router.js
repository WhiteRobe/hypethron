const FILE_ERROR_CODE = 10;


const KoaRouter = require('koa-router');
const koaBody = require('koa-body'); // @See https://www.npmjs.com/package/koa-body
const chalk = require('chalk');
const binder = require("../util/api-binder.js");

//_______import your api here________//
const loginService = require('./account/login.js');
const usernameService = require('./account/username.js');
const userAccountsService = require('./account/userAccounts.js');
const captchaService = require('./general/captcha.js');
const userProfilesService = require('./account/userProfiles.js');
const userPrivaciesService = require('./account/userPrivacies.js');

//____________________________ ______//


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
 * All of the service(RESTful-api) register to $apiRouter,
 * will expose to path: '/api/*', while $publicApiRouter will be exposed to /papi/*
 */
const apiRouter = KoaRouter();
const publicApiRouter = KoaRouter();


/**
 * The router table, any service list on this table,
 * will be register to $apiRouter.
 *
 *  - When you use/call GET|HEAD|DELETE, use $ctx.request.query to get your parameters
 *  - When you use/call POST|PUT|PATCH,  use $ctx.request.body to get your parameters
 *  - Always remember to call 'return next();'
 */
const API_ROUTER_TABLE = {
  /*"/apiExample": {
    methods: [METHOD_GET, METHOD_POST],
    services: [
      async (ctx, next) => {
        ctx.body = ctx.request.query;
        return next();
      },
      async (ctx, next) => {
        ctx.body = ctx.request.body;
        return next();
      }
    ]
  },*/
  "/userPrivacies/:uid":binder(userPrivaciesService)
};


/**
 * The router table, any service list on this table,
 * will be register to $publicApiRouter.
 */
const PUBLIC_API_ROUTER_TABLE = {
  "/captcha": binder(captchaService),
  "/login": binder(loginService),
  "/username": binder(usernameService),
  "/userAccounts/:uid": binder(userAccountsService),
  "/userProfiles/:uid":binder(userProfilesService)
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
 * Register all the service listed on $table to $routerImplement.
 *
 * @param table 路由表
 * @param routerImplement 路由器
 */
function registerAPI(table, routerImplement) {
  for (let i in table) {
    let services = table[i].services;
    table[i].methods
      .filter((item, index, self) => {
        let pass = self.indexOf(item) === index;
        if (!pass) { // 避免重复注册同一个方法
          console.warn(chalk.red("api-router.js: Warning!Repeated HTTP Method register!"));
          process.exit(FILE_ERROR_CODE);
        }
        return pass;
      })
      .forEach(
        (method, index) => registerAnService(i, method, services[index], routerImplement)
      );
  }
}


/**
 * 注册一个服务
 * @param path 地址
 * @param method HTTP 方法
 * @param service 服务 (异步)
 * @param routerImplement 路由器
 */
function registerAnService(path, method, service, routerImplement) {
  switch (method) {
    case METHOD_GET:
      routerImplement.get(path, service);
      break;
    /*case METHOD_HEAD:
      routerImplement.head(i, service);
      break;*/
    case METHOD_DELETE:
      routerImplement.del(path, service);
      break;
    case METHOD_POST:
      routerImplement.post(path, koaBody(), service);
      break;
    case METHOD_PUT:
      routerImplement.put(path, koaBody(), service);
      break;
    case METHOD_PATCH:
      routerImplement.patch(path, koaBody(), service);
      break;
    default:
      console.error(chalk.red("api-router.js: Error/Unknown HTTP Method!"));
      process.exit(FILE_ERROR_CODE);
  }
}

registerAPI(API_ROUTER_TABLE, apiRouter);
registerAPI(PUBLIC_API_ROUTER_TABLE, publicApiRouter);

module.exports.apiRouter = apiRouter;
module.exports.publicApiRouter = publicApiRouter;