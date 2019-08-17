const mailerSend = require('../../mail/mailer.js');
const fs = require('fs');
const {generatorCaptcha} = require('../../util/tools.js');
const mailerOption = require('../../mailer-configure.js');
const jwt = require('jsonwebtoken');
const {SERVER_PRIVATE_KEY, JWT_OPTIONS} = require('../../server-configure.js');
const {jwtVerify} = require('../../util/tools.js');

async function GET_emailCaptcha(ctx, next) {
  try {

  } catch (err) {

  }
  return next();
}

/**
 * 发送一个邮箱验证码，该验证码和对应的邮箱将被注册到`ctx.session.emailCaptcha`中。
 * @need-session { captcha: <token@subject:captcha> => captcha: $String }
 * @input { email: $String, captcha: $String }
 * @session { emailCaptcha: <token@subject:emailCaptcha> =>  { email: $String, captcha: $String }}
 * @output { success: $Boolean}
 */
async function POST_emailCaptcha(ctx, next) {
  let logger = ctx.global.logger;

  let targetEmail = ctx.request.body.email;
  let captchaClient = ctx.request.body.captcha;
  let captchaServer = ctx.session.captcha;

  ctx.assert(captchaServer, 400, '@session-params:captcha is required. Try to regenerate it.');
  ctx.assert(targetEmail, 400, '@params:targetEmail is required.');
  ctx.assert(captchaClient, 400, '@params:captcha is required.');

  let decode = await jwtVerify(captchaServer, SERVER_PRIVATE_KEY, jwtOptions(`captcha`, ctx.ip))
    .catch(err => {
      ctx.session.captcha = null; // 清空过期或被篡改的数据
      ctx.throw(409, err.message);
    });

  // 不区分大小写的匹配
  ctx.assert(decode.captcha.toUpperCase() === captchaClient.toUpperCase(), 409, 'Captcha doesn\'t match.');

  let emailCaptchaCache = generatorCaptcha('String', {size: 6, charPreset: '1234567890'});

  let template = fs.readFileSync("./server/mail/register.template.html").toString();
  template = template.replace("${captcha}", '' + emailCaptchaCache.text)
    .replace("${contactLink}", `${ctx.protocol}://${ctx.host}/pages/contact_cs`); // 客服页面

  let mail = {
    from: `Hypethron ^_^<${mailerOption.auth.user}>`, // 发件人，默认为邮箱系统的登录账号
    to: targetEmail,
    subject: `账户安全中心-注册信息验证`,
    html: template
  };

  let mailID = await mailerSend(mail).catch(err => {
    ctx.throw(409, err.message);
  });

  logger.info(`${mailID} was sent to <${targetEmail}>.`);

  // Save captcha to session.
  ctx.session.emailCaptcha = jwt.sign({
    email: targetEmail,
    captcha: emailCaptchaCache.text,
  }, SERVER_PRIVATE_KEY, jwtOptions(`emailCaptcha`, ctx.ip));

  // Clean session cached-captcha
  ctx.session.captcha = null;

  ctx.body = {
    success: true
  };

  return next();
}

module.exports = {
  GET_emailCaptcha,
  POST_emailCaptcha
};


/**
 * 根据ip和主题生成/验证一个专属的captcha-token
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