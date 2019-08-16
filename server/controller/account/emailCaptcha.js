const mailerSend = require('../../mail/mailer.js');
const fs = require('fs');
const {generatorCaptcha} = require('../../util/tools.js');
const mailerOption = require('../../mailer-configure.js');

async function GET_emailCaptcha(ctx, next) {
  try {

  } catch (err) {

  }
  return next();
}

/**
 * 发送一个邮箱验证码
 * @need-session { captcha: $String }
 * @input { email: $String, captcha: $String }
 * @session { emailForBind: $String, captchaForBind: $String }
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

  // 不区分大小写的匹配
  ctx.assert(captchaServer.toUpperCase() === captchaClient.toUpperCase(), 409, 'Captcha doesn\'t match.');

  let captchaForBind = generatorCaptcha('String', {size: 6, charPreset: '1234567890'});

  let template = fs.readFileSync("./server/mail/register.template.html").toString();
  template = template.replace("${captcha}", '' + captchaForBind.text)
    .replace("${contactLink}", `${ctx.protocol}://${ctx.host}/pages/contact_cs`); // 客服页面

  let mail = {
    from: `Hypethron ^_^<${mailerOption.auth.user}>`, // 发件人，默认为邮箱系统的登录账号
    to: targetEmail,
    subject: `账户安全中心-注册信息验证`,
    html: template
  };

  let mailID = await mailerSend(mail).catch(err => {
    throw err;
  });

  logger.info(`${mailID} was sent to <${targetEmail}>.`);

  // Save captcha to session.
  ctx.session.emailForBind = targetEmail;
  ctx.session.captchaForBind = captchaForBind.text;

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