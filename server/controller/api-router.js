const KoaRouter = require('koa-router');
const koaBody = require('koa-body');

/**
 * expose all RESTful-api to /api/*
 */
const apiRouter = KoaRouter();
/*
apiRouter.all("/*", (ctx, next) =>{
  console.log(ctx.query);
  ctx.response.body = "yes you are in: " + ctx.path;
  return next();
});*/

apiRouter.get("/apiTest", (ctx, next) =>{
  console.log("/api/apiTest get", ctx.request.query);
  ctx.response.body = JSON.stringify(ctx.request.query);
  return next();
});

apiRouter.post("/apiTest", koaBody(), async (ctx, next) => {
  console.log("/api/apiTest post", ctx.request.body);
  ctx.response.body = JSON.stringify(ctx.request.body);
  return next();
});

module.exports = apiRouter;
