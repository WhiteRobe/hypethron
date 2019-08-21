const mailerSend = require('../../mail/mailer.js');
const fs = require('fs');
const {generatorCaptcha} = require('../../util/tools.js');
const mailerOption = require('../../mailer-configure.js');
const jwt = require('jsonwebtoken');
const {SERVER_PRIVATE_KEY, JWT_OPTIONS} = require('../../server-configure.js');
const {jwtVerify} = require('../../util/tools.js');


/**
 * 校验一个邮箱验证码是否正确。除非设置keepAlive为true，否则验证通过后将会销毁这个email-captcha。
 * 如果给出email地址，还会进行严格模式的校验，即校验email是否发生变动。
 * @input { emailCaptcha: $String, <opt>email:$String, <opt>keepAlive: $Boolean }
 * @need-session { emailCaptcha: <token@subject:emailCaptcha> =>  { email: $String, captcha: $String }}
 * @output { match: $Boolean}
 * @throw { 404:session数据丢失, 406: 与该emailCaptcha对应的email不是同一个地址, 409: session验证码jwt检验不通过 }
 */
async function GET_emailCaptcha(ctx, next) {
  let email = ctx.request.query.email;
  let captchaClient = ctx.request.query.emailCaptcha;
  let captchaServer = ctx.session.emailCaptcha;

  ctx.assert(captchaClient, 400, '@input:emailCaptcha is required.');
  ctx.assert(captchaServer, 404, '@session:emailCaptcha is undefined. Consider to regenerate it.');

  let decode = await jwtVerify(captchaServer, SERVER_PRIVATE_KEY, jwtOptions('emailCaptcha', ctx.ip))
    .catch(err => {
      ctx.session.emailCaptcha = null; // 清空过期或被篡改的数据
      ctx.throw(409, err.message);
    });

  if(!!email){ // 如果给出email地址，还会进行严格模式的校验，即校验email是否发生变动
    ctx.assert(email.toUpperCase() === decode.email.toUpperCase(), 406, 'Captcha doesn\'t match!'); // 比对验证码
  }

  // 不区分大小写
  let isEmailCaptchaMatched = captchaClient.toUpperCase() === decode.captcha.toUpperCase();

  if (!ctx.request.query.keepAlive) {
    ctx.session.emailCaptcha = null; // 清空已被使用的数据
  }

  ctx.body = {
    match: !!isEmailCaptchaMatched
  };

  return next();
}


/**
 * 发送一个邮箱验证码，该验证码和对应的邮箱将被注册到`ctx.session.emailCaptcha`中。
 * 操作成功后captcha会被清除。
 * @need-session { captcha: <token@subject:captcha> => captcha: $String }
 * @input { email: $String, captcha: $String, <opt>type:$String<@get-from:http.options> }
 * @set-session { emailCaptcha: <token@subject:emailCaptcha> =>  { email: $String, captcha: $String }}
 * @output { success: $Boolean<true> }
 * @throw { 404:session数据丢失, 409: session验证码jwt检验不通过, 502: 发送邮件失败 }
 */
async function POST_emailCaptcha(ctx, next) {
  let logger = ctx.global.logger;

  let targetEmail = ctx.request.body.email;
  let type = ctx.request.body.type;
  let captchaClient = ctx.request.body.captcha;
  let captchaServer = ctx.session.captcha;

  ctx.assert(targetEmail, 400, '@input:targetEmail is required.');
  ctx.assert(type, 400, '@input:type is required.');
  ctx.assert(captchaClient, 400, '@input:captcha is required.');
  ctx.assert(captchaServer, 404, '@session:captcha is required. Try to regenerate it.');

  let decode = await jwtVerify(captchaServer, SERVER_PRIVATE_KEY, jwtOptions(`captcha`, ctx.ip))
    .catch(err => {
      ctx.session.captcha = null; // 清空过期或被篡改的数据
      ctx.throw(409, err.message);
    });

  // 不区分大小写的匹配
  ctx.assert(decode.captcha.toUpperCase() === captchaClient.toUpperCase(), 409, 'Captcha doesn\'t match.');

  let emailCaptchaCache = generatorCaptcha('String', {size: 6, charPreset: '1234567890'});

  let template = fs.readFileSync("./server/mail/general.template.html").toString();
  template = template.replace("${captcha}", '' + emailCaptchaCache.text)
    .replace("${serviceName}", typeofService(type))
    .replace("${contactLink}", `${ctx.protocol}://${ctx.host}/pages/contact_cs`); // 客服页面

  let mail = {
    from: `Hypethron ^_^<${mailerOption.auth.user}>`, // 发件人，默认为邮箱系统的登录账号
    to: targetEmail,
    subject: `账户安全中心-邮箱验证`,
    html: template
  };

  let mailID = await mailerSend(mail).catch(err => {
    ctx.throw(502, err.message);
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

async function OPTIONS_emailCaptcha(ctx, next) {
  ctx.response.set('Allow', 'GET POST OPTIONS');
  ctx.body = serviceType;
  return next();
}

module.exports = {
  GET_emailCaptcha,
  POST_emailCaptcha,
  OPTIONS_emailCaptcha
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


function typeofService(type) {
  let res = serviceType[type];
  return res ? res : '业务服务';
}


const serviceType = {
  'register': '注册服务',
  'changeEmail': '绑定邮箱更换服务',
  'bindEmail': '邮箱绑定服务',
  'others': '业务服务'
};