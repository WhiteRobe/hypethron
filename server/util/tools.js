const jwt = require('jsonwebtoken'); // @See https://www.npmjs.com/package/jsonwebtoken
const {SERVER_PRIVATE_KEY, JWT_OPTIONS} = require('../server-configure.js');
const svgCaptcha = require('svg-captcha'); // @See https://www.npmjs.com/package/captchapng

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
 * 生成一个验证码
 * @param type ['', 'math'] 生成验证码的类型[普通串或数学表达式]
 * @param opt
 * @return {CaptchaObj} => {data: $SVG, text:$String}
 */
function generatorCaptcha(type, opt){
  opt = opt || {
    size:4,
    ignoreChars: '0o1i',
    noise: 3,
    color: true,
    background: '#FCFCFC',

    mathMin:1,
    mathMax: 90,
    mathOperator:'+-'
  };
  let generator = type === 'math'? svgCaptcha.createMathExpr : svgCaptcha.create;
  return generator(opt);
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
  generatorCaptcha,
  jwtVerify,
  isJwtError
};