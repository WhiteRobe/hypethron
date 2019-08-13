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
 * @param options
 * @return {Promise<*>}
 */
async function jwtVerify(token, key, options) {
  key = key || SERVER_PRIVATE_KEY;
  options = options || JWT_OPTIONS;
  if (!token) {
    throw new TypeError("TokenNotFound");
  }
  return new Promise((reject, resolve) => {
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

module.exports = {
  timeUsage,
  jwtVerify
};