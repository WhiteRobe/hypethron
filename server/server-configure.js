const {aesDecrypt, aesEncrypt} = require("./util/crypto-aes-tool.js");

/**
 * Configure Your SERVER
 */

// STATIC_DIRECTORY 的目录是相对于start-server.js文件的
// sslOptions 的目录是相对于根目录的

// >>> 服务器注册配置表 >>>
const SERVER_CONFIG = {
  def: {
    port: 3000, // Server port
    enableSLL: false, // Wanna to start a ssl http-server?
    sslOptions: { // Only required when $enableSLL is true
      key: null, // Your private-key URL
      cert: null  // Your ssl-certificate URL
    }
  },
  // You can run an extra HTTPS-server by adding this:
  /*
  ssl: {
    port: 3001,
    enableSLL: true,
    sslOptions: {
      key: './server/ssl/privateKey.pem',
      cert: './server/ssl/certificate.pem'
    }
  }*/
  /* 你可以通过以下命令生成一份自签名的SSL证书:
      #1、生成私钥key文件：
      openssl genrsa -out privateKey.pem 1024

      #2、通过私钥生成CSR证书签名  （需要填一些信息、可直接回车）
      openssl req -new -key privateKey.pem -out certrequest.csr

      #3、通过私钥和证书签名生成证书文件
      openssl x509 -req -in privateKey.csr -signkey privateKey.pem -out certificate.pem
  */
};
// <<< 服务器注册配置表 <<<


// >>> 服务器运行常量 >>>
const SKIP_HYPETHRON_INTRO_PAGE = false;
const STATIC_DIRECTORY = '../build'; // Where the production-spa is
const SERVER_PRIVATE_KEY = "WhiteRobe/hypethron@Github"; // 服务器私钥
const SERVER_SALT = "WhiteRobe/hypethron@Github"; // Server salt
const JWT_PROTECT_UNLESS = [/^\/[\w\.]*$/, /^\/static/, /^\/pages/, /^\/papi/]; // 非JWT控制目录
const JWT_OPTIONS = {
  algorithm: "HS256",
  // audience: (ctx) => ctx.ip, // 这两个值不应在此处被设置
  // subject: "hypethron/users",
  issuer: "WhiteRobe/hypethron@Github",
  expiresIn: "7d"
};
const KOA_JWT_CONFIGURE = { // JWT的解码值将会存放到 ctx.state.jwtData 中，原值将被放到 ctx.state.originToken
  secret: SERVER_PRIVATE_KEY,
  key: 'jwtData',
  tokenKey: "originToken",
  // audience: (ctx) => ctx.ip, // 这两个值不应在此处被设置
  // subject: JWT_OPTIONS.subject,
  issuer: JWT_OPTIONS.issuer
};
const COOKIE_KEY_LIST = [SERVER_PRIVATE_KEY, 'I Like hypethron'];
const KOA_SESSION_CONFIGURE = { // @See https://www.npmjs.com/package/koa-session
  key: 'hypethron:sess', // (string) cookie key
  maxAge: 86400000, // (ms), 1 day -> 86400000 { Any adjustment ont this value is not recommended }
  autoCommit: true,
  overwrite: true,
  httpOnly: true, // 防止JS脚本进行修改
  signed: true,
  rolling: false,
  renew: true,
  encode: (data) => aesEncrypt(JSON.stringify(data)), // 不采用Base64进行加解密，而使用AES。
  decode: (data) => JSON.parse(aesDecrypt(data)),
  // 启用本属性以使用 External Session Stores，性能分析@See https://www.npmjs.com/package/koa-redis#benchmark
  // 或设置 store: true 采用本项目封装好的`/server/dao/redis-connect.js:createRedisSession()`
  // store: {
  //  配置，如: new require('koa-redis')(); //@example https://github.com/eggjs/egg-session-redis/blob/master/app.js#L12
  // }
  //Use external session stores only if necessary, avoid using session as a cache, keep the session lean, and store it in a cookie if possible!
};
const RATE_LIMIT_CONFIGURE = {  // @See https://github.com/koajs/ratelimit
  // db: new Redis(),
  duration: 60000, // (ms)
  errorMessage: '喝杯咖啡休息一下吧./Sometimes You Just Have to Slow Down.',
  id: (ctx) => ctx.ip,
  max: 600,
  disableHeader: false,
  // blacklist: ctx => false,
  throw: true
};

// <<< 服务器运行常量 <<<


module.exports.SERVER_DEBUG = (process.env.DEBUG === undefined ? false : process.env.DEBUG.toUpperCase() === "TRUE");
module.exports.SERVER_CONFIG = SERVER_CONFIG;
module.exports.SKIP_HYPETHRON_INTRO_PAGE = SKIP_HYPETHRON_INTRO_PAGE;
module.exports.STATIC_DIRECTORY = STATIC_DIRECTORY;
module.exports.SERVER_PRIVATE_KEY = SERVER_PRIVATE_KEY;
module.exports.SERVER_SALT = SERVER_SALT;
module.exports.JWT_PROTECT_UNLESS = JWT_PROTECT_UNLESS;
module.exports.JWT_OPTIONS = JWT_OPTIONS;
module.exports.KOA_JWT_CONFIGURE = KOA_JWT_CONFIGURE;
module.exports.COOKIE_KEY_LIST = COOKIE_KEY_LIST;
module.exports.KOA_SESSION_CONFIGURE = KOA_SESSION_CONFIGURE;
module.exports.RATE_LIMIT_CONFIGURE = RATE_LIMIT_CONFIGURE;