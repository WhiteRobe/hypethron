const jwt = require('jsonwebtoken'); // @See https://www.npmjs.com/package/jsonwebtoken
const {SERVER_PRIVATE_KEY, JWT_OPTIONS} = require('../server-configure.js');
const svgCaptcha = require('svg-captcha'); // @See https://github.com/lemonce/svg-captcha
const base64 = require('base64-js'); // @See https://github.com/beatgammit/base64-js

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
 * @param type ['text', 'math'] 生成验证码的类型[普通串或数学表达式]
 * @param opt 生成可选参数项 @See https://github.com/lemonce/svg-captcha#api
 * @return {CaptchaObj} => {data: $SVG, text:$String}
 */
function generatorCaptcha(type, opt) {
  let defaultOpt = {
    size: 4,
    ignoreChars: '0o1i',
    noise: 3,
    color: true,
    background: '#FCFCFC',

    mathMin: 1,
    mathMax: 90,
    mathOperator: '+-'

    // charPreset: '1234567890',
    // width: 50,
    // height:100,
    // fontSize:5
  };
  opt = Object.assign(defaultOpt, opt);
  let generator = type === 'math' ? svgCaptcha.createMathExpr : svgCaptcha.create;
  return generator(opt);
}


/**
 * 验证一个Token
 * @param token
 * @param key:String(opt)
 * @param options:Object(opt) @See https://www.npmjs.com/package/jsonwebtoken
 * @return {Promise<*>}
 */
async function jwtVerify(token, key, options) {
  if (typeof key !== "string") {
    options = key;
    key = undefined;
  }
  key = key || SERVER_PRIVATE_KEY;
  let jwtOpt = Object.assign({}, JWT_OPTIONS);
  jwtOpt = Object.assign(jwtOpt, options);
  if (!token) {
    throw new TypeError("TokenNotFound");
  }
  token = token.replace(/^Bearer /, ""); // 移除 koa-jwt的保护字段 "Bearer <token>"
  return new Promise((resolve, reject) => {
      jwt.verify(token, key, jwtOpt, (err, decoded) => {
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
function isJwtError(err) {
  // Or just -> return err instanceof jwt.JsonWebTokenError;
  return err instanceof jwt.JsonWebTokenError
    || err instanceof jwt.NotBeforeError
    || err instanceof jwt.TokenExpiredError;
}


/**
 * 返回一个base64url编码的字符串
 * @param arg [string or byte-array]
 * @return {string}
 */
function base64urlEncode(arg) {
  let b64 = 'error';
  if (typeof arg === 'string') {
    b64 = Buffer.from(arg, 'utf8').toString("base64");
  } else {
    b64 = base64.fromByteArray(arg);
  }
  return b64
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}


/**
 * 解码一个base64编码的字符串
 * @param arg
 * @return {string}
 */
function base64urlDecode(arg) {
  function padString(input) {
    let segmentLength = 4;
    let stringLength = input.length;
    let diff = stringLength % segmentLength;

    if (!diff) {
      return input;
    }

    let position = stringLength;
    let padLength = segmentLength - diff;
    let paddedStringLength = stringLength + padLength;
    let buffer = Buffer.alloc(paddedStringLength);

    buffer.write(input);

    while (padLength--) {
      buffer.write("=", position++);
    }

    return buffer.toString();
  }

  function toBase64(base64url) {
    base64url = base64url.toString();
    return padString(base64url)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
  }

  return Buffer.from(toBase64(arg), "base64").toString('utf8');
}

module.exports = {
  timeUsage,
  generatorCaptcha,
  jwtVerify,
  isJwtError,
  base64urlEncode,
  base64urlDecode
};