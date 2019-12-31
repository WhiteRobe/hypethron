const KoaRouter = require('koa-router');
const koaBody = require('koa-body'); // Inject to solve POST|PUT|PATCH body
const fs = require('fs');
const path = require('path');
// koa-body @See https://github.com/dlau/koa-body#options or http://www.ptbird.cn/koa-body.html

const router = KoaRouter({prefix: ""}); // add a server-router with prefix

/*
* Remember to register all routers here
* */

// When you use/call GET|HEAD|DELETE, use $ctx.query to get your parameters
// When you use/call POST|PUT|PATCH, you need to inject koa-body
// There are two examples here:
router.get("/test", async (ctx, next) => {
  // console.log(ctx.query);
  ctx.body = JSON.stringify(ctx.query);
  return next();
});


router.post("/test", koaBody(), async (ctx, next) => {
  // console.log(ctx.request.body);
  ctx.body = JSON.stringify(ctx.request.body);
  return next();
});


/**
 * expose RESTful-api to /api/* with the protect of JWT while /papi/* not
 */
const {apiRouter, publicApiRouter} = require('./controller/api-router');
router.use("/api", apiRouter.routes(), apiRouter.allowedMethods());
router.use("/papi", publicApiRouter.routes(), publicApiRouter.allowedMethods());

/**
 * expose all pages to /pages/*
 */
const staticPageRouter = KoaRouter();
staticPageRouter.all("/*", (ctx, next) =>{
  ctx.response.type = "text/html";
  ctx.response.body = fs.readFileSync(
    path.join(__dirname, require('./server-configure.js').STATIC_DIRECTORY, 'index.html')
  );
  return next();
});
router.use("/pages", staticPageRouter.routes(), staticPageRouter.allowedMethods());


module.exports = router;


