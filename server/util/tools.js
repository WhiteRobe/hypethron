const jwt = require('jsonwebtoken'); // @See https://www.npmjs.com/package/jsonwebtoken
const {SERVER_PRIVATE_KEY, JWT_OPTIONS} = require('../server-configure.js');

/**
 * 测试一段代码的运行时间
 * @param func 要执行的代码
 */
function timeUsage(func) {
  console.time();
  func();
  console.timeEnd();
}

/**
 * 验证一个Token
 * @param token
 * @param key
 * @param options @See https://www.npmjs.com/package/jsonwebtoken
 * @return {Promise<*>}
 */
async function jwtVerify(token, key, options) {
  key = key || SERVER_PRIVATE_KEY;
  options = options || JWT_OPTIONS;
  if (!token) {
    throw new TypeError("TokenNotFound");
  }
  token = token.replace(/^Bearer /, ""); // 移除 koa-jwt的保护字段 "Bearer <token>"
  return new Promise((resolve, reject) => {
      jwt.verify(token, key, options, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    }
  );
}


/**
 * Is an error is a instance of JsonWebTokenError?
 * @param err
 * @return {Promise<boolean>}
 */
function isJwtError(err){
  // Or just -> return err instanceof jwt.JsonWebTokenError;
  return err instanceof jwt.JsonWebTokenError
    || err instanceof jwt.NotBeforeError
    || err instanceof jwt.TokenExpiredError;
}

module.exports = {
  timeUsage,
  jwtVerify,
  isJwtError
};