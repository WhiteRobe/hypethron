const {generatorCaptcha} = require('../../util/tools.js');
const {jwtVerify} = require('../../util/tools.js');
const jwt = require('jsonwebtoken');
const {SERVER_PRIVATE_KEY, JWT_OPTIONS} = require('../../server-configure.js');

/**
 * 新建并返回一个验证码，该验证码将被注册到`ctx.session.captcha`中；支持生成`math`表达式。
 * @input { type:$String['', 'math'], captchaLength<opt>: $Int }
 * @set-session { captcha: <token@subject:captcha> => captcha: $String }
 * @output { $svg } 一个svg数据 <img src=".../captcha"/>
 * @throw { 409: 生成验证码失败 }
 */
async function GET_captcha(ctx, next) {
  try {
    let captchaLength = ctx.request.query.captchaLength;
    let captcha = generatorCaptcha(ctx.request.query.type, {size: captchaLength || 4});

    ctx.session.captcha = jwt.sign({ // 保存到session中
      captcha: captcha.text,
    }, SERVER_PRIVATE_KEY, jwtOptions('captcha', ctx.ip));

    ctx.response.type = "image/svg+xml";

    ctx.body = captcha.data;

  } catch (err) {
    ctx.throw(409, err.message);
  }

  return next();
}


/**
 * 比对验证码，获取比对结果。比对成功将清除所记录的captcha，可设置$keepAlive=true使其不被清除。
 * @need-session { captcha: <token@subject:captcha> => captcha: $String }
 * @input { captcha: $String, <opt>keepAlive: $Boolean }
 * @output { match: $Boolean }
 * @throw { 404:session数据丢失, 409: session验证码jwt检验不通过 }
 */
async function POST_captcha(ctx, next) {

  let captcha = ctx.request.body.captcha;
  let captchaServer = ctx.session.captcha;

  ctx.assert(captcha, 400, '@input:captcha is required.');
  ctx.assert(captchaServer, 404, '@session:captcha is undefined. Consider to regenerate it.');

  let decode = await jwtVerify(captchaServer, SERVER_PRIVATE_KEY, jwtOptions('captcha', ctx.ip))
    .catch(err => {
      ctx.session.captcha = null; // 清空过期或被篡改的数据
      ctx.throw(409, err.message);
    });

  // 不区分大小写
  let isMatched = captcha.toUpperCase() === decode.captcha.toUpperCase();

  // ctx.assert(isMatched, 406, 'Captcha doesn\'t match!'); // 比对验证码

  if (!ctx.request.body.keepAlive) {
    ctx.session.captcha = null; // 清空已被使用的数据
  }

  ctx.body = {
    match: !!isMatched
  };

  return next();
}

module.exports = {
  GET_captcha,
  POST_captcha
};


/**
 * 根据ip生成/验证一个专属的captcha-token
 * @param subject
 * @param ip
 * @return {{expiresIn: string, audience: *, subject: string, issuer: string, algorithm: string}}
 */
function jwtOptions(subject, ip) {
  return {
    algorithm: JWT_OPTIONS.algorithm,
    audience: ip,
    subject: `hypethron/users/${subject}`,
    issuer: JWT_OPTIONS.issuer,
    expiresIn: "10m" // 10 分钟有效期
  }
}