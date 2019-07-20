const Koa = require('koa');
const koa_static = require('koa-static');
const koa_compress = require('koa-compress');
const koa_helmet = require('koa-helmet');
const koa_convert = require('koa-convert'); // Convert koa legacy generator middleware to modern promise middleware.
const koa_jwt = require('koa-jwt');
const koa_session = require('koa-session');

const http = require('http');
const https = require('https');

const chalk = require('chalk');  // @See  https://www.npmjs.com/package/chalk
const path = require('path');
const fs = require('fs');
require('keygrip')

const redisConnect = require('./dao/redis-connector.js');
const {
  SERVER_DEBUG,
  SERVER_CONFIG,
  SKIP_HYPETHRON_INTRO_PAGE,
  STATIC_DIRECTORY,
  KOA_JWT_CONFIGURE,
  JWT_PROTECT_UNLESS,
  COOKIE_KEY_LIST,
  KOA_SESSION_CONFIGURE
} = require('./server-configure.js');
const {log4js, accessLogger} = require("./logger-configure.js");
const router = require('./server-router.js');
const koaIpFilter = require('./ip-filter-configure.js');

const {global} = require('./util/global.js');
const errorHandler = require('./util/errorHandler.js');
const jwt = require('jsonwebtoken');

const app = new Koa();
app.keys = COOKIE_KEY_LIST;

(async function () { // 启动服务器

  // >>> import middleware and load router>>>
  app
    .use(koa_session(KOA_SESSION_CONFIGURE, app)) // Use koa-session with `hypethron:sess` as cookie-key(default)
    .use(accessLogger()) // Use access-logger for koa
    .use(koa_convert(koaIpFilter())) // Ip filter, and 'koa-ip-filter' should be convert
    .use(koa_helmet()) // Use module 'helmet' to provide important security headers
    .use(koa_compress({
      // filter: (content_type) => { return /text/i.test(content_type) },
      threshold: 2048, // 大于2kb时进行压缩
      flush: require('zlib').constants.Z_SYNC_FLUSH
    }))
    .use( // ues koa-jwt to validate
      koa_jwt(KOA_JWT_CONFIGURE)                   // Decode data will be put into $ctx.state.jwtData,
        .unless({path: JWT_PROTECT_UNLESS}) // and origin into $ctx.state.originToken
    )
    .use(koa_static(path.join(__dirname, STATIC_DIRECTORY), {
      defer: true // Allowing any downstream middleware to respond first, work with koa-router
    }));

  if (SKIP_HYPETHRON_INTRO_PAGE) {
    app.use(async (ctx, next) => {
      if (ctx.request.path === "/") {
        ctx.response.redirect('/pages/home');
      }
      return next();
    });
  }

  app
    .use(router.routes())
    .use(router.allowedMethods());
  // <<< import middleware and load router<<<


  app.on('error', (err, ctx) => {
    if (SERVER_DEBUG) {
      console.error(chalk.red('[Debug]Server Error'), err/*, ctx*/);
    } else {
      errorHandler(err);
    }
  });

  for (let i in SERVER_CONFIG) {
    // >>> params >>>
    let SERVER_NAME = i;
    let PORT = SERVER_CONFIG[i].port; // Server Port
    // >>> params >>>


    // >>> Ready to start the server >>>
    // Start the router and Server Start!
    if (SERVER_CONFIG[i].enableSLL) {
      const sslOptions = {
        key: fs.readFileSync(SERVER_CONFIG[i].sslOptions.key),
        cert: fs.readFileSync(SERVER_CONFIG[i].sslOptions.cert)
      };
      https.createServer(sslOptions, app.callback()).listen(PORT, () => {
        _serverStartTip(SERVER_NAME, PORT, true);
      });
    } else {
      http.createServer(app.callback()).listen(PORT, () => {
        _serverStartTip(SERVER_NAME, PORT, false);
      });
    }

  }

  // Add an logger, and bind it to this server
  const logger = log4js.getLogger('application');
  logger.addContext('loggerName', 'Hypethron');
  registerLogger(logger);
  // <<< Ready to start the server <<<

  // test redis connection
  // If you do not want to use redis, comment out this line.
  await redisConnectTest(logger)
    .then(res =>{
      logger.info(res.message);
    })
    .catch((err) => {
      logger.error(`Fail to connect to Redis[Error]: ${err.message}`);
      process.exit(1); // 如果连不上数据库直接终止进程
    });

  console.log(chalk.yellow("Tip:If you are using a command, press [Ctrl+C] or [Ctrl+Z] to exit.\n"));
  console.log(chalk.bold  ("---------------------------------------------------------"));
})();


/**
 * 数据库接入测试
 */
async function redisConnectTest() {
  let redis = await redisConnect(true /*connect with default params, but put detail*/);
  redis.set("hypethron.redis-connect-test", "Success!");
  try{
    await redis.get("hypethron.redis-connect-test", (err, result) => {
      if (err !== null) {
        let errorMsg = "Fail to connect to Redis[Error]: " + err;
        console.log(chalk.red(errorMsg));
      } else {
        console.log(chalk.green("[Hypethron]Redis Connect Test:", result, '\n'));
      }
    });
  } catch (e) {
    throw e;
  }
  await redis.del("hypethron.redis-connect-test");
  await redis.disconnect();
  return{
    message: "[Hypethron]Connect To Redis!"
  }
}


/**
 * Tip for server start!
 * @param NAME:String The server name
 * @param PORT:Int The port that server is listening
 * @param ssl:boolean Is an HTTPS server?
 */
function _serverStartTip(NAME, PORT, ssl) {
  let protocol = ssl ? 'https' : 'http';
  console.log(chalk.bold("-----[" + new Date() + "]-----\n"));
  console.log(chalk.greenBright(`Server[${NAME}] Open In Port[${PORT}] Successfully! Waiting for Redis connection..\n`));
  console.log(chalk.cyan(`Local-HOST Start At:\t ${protocol}://localhost:${PORT}/\n`));
}


/**
 * Register a logger to /utils/global.js
 * @param logger
 */
function registerLogger(logger) {
  global.logger = logger;
}

