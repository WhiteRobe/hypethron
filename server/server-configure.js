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
};
// <<< 服务器注册配置表 <<<

// >>> 服务器运行常量 >>>
const SERVER_DEBUG = true;
const SKIP_HYPETHRON_INTRO_PAGE = false;
const STATIC_DIRECTORY = '../build'; // Where the production-spa is
const SERVER_PRIVATE_KEY = "WhiteRobe/hypethron@Github"; // 服务器私钥
const MD5_SALT = "WhiteRobe/hypethron@Github"; // MD5 salt
const JWT_PROTECT_UNLESS = [/^\/[\w\.]*$/, /^\/static/, /^\/pages/, /^\/papi/]; // 非JWT控制目录
const JWT_OPTIONS = {
  audience: "github",
  issuer: "WhiteRobe/hypethron@Github"
};
const KOA_JWT_CONFIGURE = { // JWT的解码值将会存放到 ctx.state.jwtData 中，原值将被放到 ctx.state.originToken
  secret: SERVER_PRIVATE_KEY,
  key: 'jwtData',
  tokenKey: "originToken",
  audience: JWT_OPTIONS.audience,
  issuer: JWT_OPTIONS.issuer
};
// <<< 服务器运行常量 <<<


module.exports.SERVER_DEBUG = SERVER_DEBUG;
module.exports.SERVER_CONFIG = SERVER_CONFIG;
module.exports.SKIP_HYPETHRON_INTRO_PAGE = SKIP_HYPETHRON_INTRO_PAGE;
module.exports.STATIC_DIRECTORY = STATIC_DIRECTORY;
module.exports.SERVER_PRIVATE_KEY = SERVER_PRIVATE_KEY;
module.exports.MD5_SALT = MD5_SALT;
module.exports.JWT_PROTECT_UNLESS = JWT_PROTECT_UNLESS;
module.exports.JWT_OPTIONS = JWT_OPTIONS;
module.exports.KOA_JWT_CONFIGURE = KOA_JWT_CONFIGURE;

/*
你可以通过以下命令生成一份自签名的SSL证书:
    #1、生成私钥key文件：
    openssl genrsa -out privateKey.pem 1024

    #2、通过私钥生成CSR证书签名  （需要填一些信息、可直接回车）
    openssl req -new -key privateKey.pem -out certrequest.csr

    #3、通过私钥和证书签名生成证书文件
    openssl x509 -req -in privateKey.csr -signkey privateKey.pem -out certificate.pem
*/