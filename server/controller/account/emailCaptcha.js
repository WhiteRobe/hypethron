const mailerSend = require('../../mail/mailer.js');
const {global, RES_MSG} = require('../../util/global.js');
const fs = require('fs');
const {generatorCaptcha} = require('../../util/tools.js');
const {DOMAIN_NAME} = require('../../server-configure.js');
const mailerOption = require('../../mailer-configure.js');

async function GET_emailCaptcha(ctx, next) {
  try {

  } catch (err) {

  }
  return next();
}

/**
 * @input { email: $String }
 * @session { emailForBind: $String, captchaForBind: $String }
 * @output { success: $Boolean}
 */
async function POST_emailCaptcha(ctx, next) {
  try {
    let targetEmail = ctx.request.body.email;

    let captcha = generatorCaptcha('String', {size: 6, charPreset: '1234567890'});

    let template = fs.readFileSync("./server/mail/register.template.html").toString();
    template = template.replace("${captcha}", '' + captcha.text)
      .replace("${contactLink}", `${DOMAIN_NAME}/pages/contact_cs`); // 客服页面

    let mail = {
      from: `Hypethron ^_^<${mailerOption.auth.user}>`, // 发件人，默认为邮箱系统的登录账号
      to: targetEmail,
      subject: `账户安全中心-注册信息验证`,
      html: template
    };

    await mailerSend(mail).catch(err => {
      throw err;
    });

    ctx.session.emailForBind = targetEmail;
    ctx.session.captchaForBind = captcha.text;

    ctx.body = {
      success: true,
      msg: RES_MSG.OK
    };

  } catch (err) {
    ctx.session.emailForBind = null;
    ctx.session.captchaForBind = null;

    ctx.body = {
      success: false,
      msg: RES_MSG.SEND_MAIL_FAIL,
      errorDetail: `${RES_MSG.SEND_MAIL_FAIL}:${err.message}`
    }
  }
  return next();
}

module.exports = {
  GET_emailCaptcha,
  POST_emailCaptcha
};