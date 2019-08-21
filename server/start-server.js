const Koa = require('koa');
const koa_static = require('koa-static');
const koa_compress = require('koa-compress');
const koa_helmet = require('koa-helmet');
const koa_jwt = require('koa-jwt');
const koa_session = require('koa-session');
const ratelimit = require('koa-ratelimit');

const http = require('http');
const https = require('https');

const chalk = require('chalk');  // @See  https://www.npmjs.com/package/chalk
const path = require('path');
const fs = require('fs');
const ipFilter = require('ip-filter'); // @See https://github.com/tunnckoCore/ip-filter

const smtpTest = require('./mail/smtp-test.js');
const {connectRedis, redisConnectTest, getRedisPool, createRedisSession} = require('./dao/redis-connector.js');
const {mysqlConnectTest, getMySQLPool} = require('./dao/mysql-connector.js');
const {buildTables} = require('./dao/database-init.js');
const {MySQLPoolManager, RedisPoolManager} = require('./dao/db-manager.js');

const {
  SERVER_DEBUG,
  SERVER_CONFIG,
  SKIP_HYPETHRON_INTRO_PAGE,
  STATIC_DIRECTORY,
  KOA_JWT_CONFIGURE,
  JWT_PROTECT_UNLESS,
  COOKIE_KEY_LIST,
  KOA_SESSION_CONFIGURE,
  RATE_LIMIT_CONFIGURE,
  SERVER_PRIVATE_KEY,
  SERVER_SALT,
  SESSION_AES_KEY
} = require('./server-configure.js');
const {log4js, accessLogger} = require("./logger-configure.js");
const router = require('./server-router.js');
const IP_FILTER_CONFIGURE = require('./ip-filter-configure.js');

const {global, AUTH} = require('./util/global.js');
const {errorHandler, afterErrorHandler} = require('./util/errorHandler.js');

// ------------------  //
const BLACK_LIST = []; // Dynamic black list, will be rest on 00:00:00 every day.
const app = new Koa();
app.keys = COOKIE_KEY_LIST;


(async function () { // 启动服务器
  console.log(chalk.magenta(`Welcome to Hypethron. @see https://github.com/WhiteRobe/hypethron for more detail.\n`));
  // Add an logger, and bind it to this server
  const logger = log4js.getLogger('application');
  logger.addContext('loggerName', 'Hypethron');
  registerLogger(logger);

  // >>> test mysql/redis/SMTP connection >>>
  await mysqlConnectTest()
    .then(res => {
      logger.info(res.message);
    })
    .catch((err) => {
      logger.error(`Fail to connect to MySQL[Error]: ${err.message}`);
      process.exit(2); // 如果连不上数据库直接终止进程
    });

  await redisConnectTest()
    .then(res => { // If you do not want to use redis, comment out this line.
      logger.info(res.message);
    })
    .catch((err) => {
      logger.error(`Fail to connect to Redis[Error]: ${err.message}`);
      process.exit(3); // 如果连不上数据库直接终止进程
    });

  await smtpTest()
    .then(res => {
      logger.info(res.message);
    })
    .catch(err => {
      logger.error(`Fail to connect to SMTP[Error]: ${err.message}`);
      process.exit(4); // 如果连不上数据库直接终止进程
    });

  // <<< test redis/mysql/SMTP connection <<<

  // >>> Get MySQL/Redis connection pool with default options >>>
  await getMySQLPool()
    .then((pool) => {
      registerMySQLPool(pool);
      pool.getConnection((err, conn) => {
        if (err) throw err;
        buildTables('./server/dao/hypethron-database.sql', conn); // init mysql-database's tables
      });
    });
  await getRedisPool()
    .then((pool) => {
      registerRedisPool(pool)
    });

  let redisSession = KOA_SESSION_CONFIGURE.store === true ? await createRedisSession() : KOA_SESSION_CONFIGURE.store;
  let ratelimitRedis = connectRedis(false, {db: 1});
  // <<< Get MySQL/Redis connection pool with default options <<<

  const STATIC_RATE_LIMIT_CONFIGURE = Object.assign({
    db: ratelimitRedis,
    blacklist: (ctx) => {
      if (ctx.BLACK_LIST) {
        return ctx.BLACK_LIST.indexOf(ctx.ip) >= 0
      }
      return false;
    }
  }, RATE_LIMIT_CONFIGURE);
  const STATIC_KOA_SESSION_CONFIGURE = Object.assign(KOA_SESSION_CONFIGURE, {store: redisSession});
  //

  // >>> import middleware and load router >>>
  app
    .use((ctx, next) => { // Register global-values
      ctx.BLACK_LIST = BLACK_LIST; // dynamic-blacklist
      ctx.IP_FILTER_CONFIGURE = IP_FILTER_CONFIGURE;
      ctx.global = global;
      ctx.AUTH = AUTH;
      ctx.SERVER_DEBUG = SERVER_DEBUG;
      tryReleaseIPOnBlacklist(ctx).then().catch(err => console.error(err));
      return next();
    })
    .use(IpFilter(logger))
    .use(ratelimit(STATIC_RATE_LIMIT_CONFIGURE))
    .use(koa_session(STATIC_KOA_SESSION_CONFIGURE, app)) // Use koa-session with `hypethron:sess` as cookie-key(default)
    .use(koa_helmet()) // Use module 'helmet' to provide important security headers
    .use(accessLogger()) // Use access-logger for koa
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
    }))
    .use((ctx, next) => { //
      return next().catch(err => { // Handling exceptions manually
        errorHandler(err, ctx);
        ctx.app.emit('error', err, ctx);
      })
    });

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

  // >>> import error-handler >>>
  app.on('error', async (err, ctx) => {
    afterErrorHandler(err, ctx);
  });
  // <<< import error-handler <<<

  for (let i in SERVER_CONFIG) {
    // >>> params >>>
    let SERVER_NAME = i;
    let PORT = SERVER_CONFIG[i].port; // Server Port
    // >>> params >>>


    // >>> Ready to start the server >>>
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
    // <<< Ready to start the server <<<
  }
})();


/**
 * Tip for server start!
 * @param NAME:String The server name
 * @param PORT:Int The port that server is listening
 * @param ssl:boolean Is an HTTPS server?
 */
function _serverStartTip(NAME, PORT, ssl) {
  let protocol = ssl ? 'https' : 'http';
  console.log(chalk.bold("-----[" + new Date() + "]-----\n"));
  console.log(chalk.greenBright(`Server[${NAME}] Open In Port[${PORT}] Successfully!\n`));
  console.log(chalk.cyan(`Local-HOST Start At:\t ${protocol}://localhost:${PORT}/\n`));
  console.log(chalk.yellow("Tip:If you are using a command, press [Ctrl+C] or [Ctrl+Z] to exit.\n"));
  console.log(chalk.bold("---------------------------------------------------------"));
  console.log();
  checkServerKeyIsTooWeak();
}


/**
 * Register a logger to /utils/global.js
 * @param logger
 */
function registerLogger(logger) {
  global.logger = logger;
}

/**
 * Register a mysql-connection pool to /utils/global.js
 * @param pool
 */
function registerMySQLPool(pool) {
  global.mysqlPoolDM = new MySQLPoolManager(pool);
}

/**
 * Register a redis-connection pool to /utils/global.js
 * @param pool
 */
function registerRedisPool(pool) {
  global.redisPoolDM = new RedisPoolManager(pool);
}

/**
 * async try release IP on blacklist at 00:00:00 every day.
 * @param ctx
 */
async function tryReleaseIPOnBlacklist(ctx) {
  if (new Date().getHours() === 0) { // 每天零点释放动态黑名单用户
    ctx.BLACK_LIST.splice(0, ctx.BLACK_LIST.length);
  }
}


/**
 * @middleware IP过滤器
 * @param logger 日志类
 * @context 依赖上下文 `ctx.IP_FILTER_CONFIGURE`
 * @return {Function}
 */
function IpFilter(logger) {
  logger = logger || {info: (msg) => console.log(msg)};
  return async function (ctx, next) { // Ip filter
    let config = ctx.IP_FILTER_CONFIGURE || {
      filter: [],
      whitelist: [],
      forbiddenMsg: '403: Forbidden'
    };

    if (ipFilter(ctx.ip, config.filter, {strict: false})) { // in black list
      for (let s of config.whitelist) { // is it in whitelist?
        if (ctx.ip.indexOf(s) >= 0) {
          return next(); // yes, request go.
        }
      }
      if (!ctx.app.silent) {
        logger.info(`Black user [${ctx.ip}] try to login but been blocked.`);
      }
      ctx.throw(403, config.forbiddenMsg);
    }
    return next();
  }
}

/**
 * Check Whether the Server-Keys Is Too Weak
 */
function checkServerKeyIsTooWeak() {
  if (SERVER_DEBUG) {
    return console.log(chalk.blue('Info: You are in debug mode. Use `SET DEBUG=false` to turn off.'));
  } else {
    console.log(chalk.blue('Info: Server run on production mode. Use `SET DEBUG=true` to turn on debug mode.'));
  }
  if (SERVER_PRIVATE_KEY === SERVER_SALT) {
    console.warn(chalk.yellow('Warning: You should use different values of $SERVER_PRIVATE_KEY and $SERVER_SALT in ' +
      '`/server/server-configure.js`, if you want to deploy your server in production environment.'));
  }
  if (SERVER_PRIVATE_KEY === 'WhiteRobe/hypethron@Github') {
    console.warn(chalk.yellow('Warning: You should change the value of $SERVER_PRIVATE_KEY in ' +
      '`/server/server-configure.js`, if you want to deploy your server in production environment.'));
  }
  if (SERVER_SALT === 'WhiteRobe/hypethron@Github') {
    console.warn(chalk.yellow('Warning: You should change the value of $SERVER_SALT in `/server/server-configure.js`,' +
      ' if you want to deploy your server in production environment.'));
  }
  if (SESSION_AES_KEY.key === 'hypethron@Github' || SESSION_AES_KEY.key.length !== 16) {
    console.warn(chalk.yellow('Warning: You should change the value of $SESSION_AES_KEY.key in `/server/server-configure.js`' +
      ' and make it\'s length equal to  16, if you want to deploy your server in production environment.'));
  }
  if (SESSION_AES_KEY.iv === 'hypethron@Github' || SESSION_AES_KEY.iv.length !== 16) {
    console.warn(chalk.yellow('Warning: You should change the value of $SESSION_AES_KEY.iv in `/server/server-configure.js`' +
      ' and make it\'s length equal to 16, if you want to deploy your server in production environment.'));
  }
}