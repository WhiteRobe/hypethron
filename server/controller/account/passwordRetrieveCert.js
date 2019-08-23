const {jwtVerify, base64urlEncode} = require('../../util/tools.js');
const jwt = require('jsonwebtoken');
const {SERVER_PRIVATE_KEY, JWT_OPTIONS, SERVER_SALT} = require('../../server-configure.js');
const mailerSend = require('../../mail/mailer.js');
const fs = require('fs');
const mailerOption = require('../../mailer-configure.js');
const {generateSalt, hmac} = require('../../util/crypto-hash-tool.js');


/**
 * 申请找回密码，向绑定的邮箱发送一份邮件，以获得相应的认证`retrievePWCert`。
 * @input { email: $String, captcha: $String }
 * @need-session { captcha: <token@subject:captcha> => captcha: $String }
 * @set-params { retrievePWCert: $String<@random-value<1>> }
 * @set-session { @set-params[retrievePWCert]: <token@subject:retrievePWCert> => uid: $Int }
 * @output { success: $Boolean<true> }
 * @throw {403: 认证不通过(无此账号), 404:session数据丢失, 406: 验证码不匹配, 409: session验证码jwt检验不通过, 502: 发送邮件失败 }
 */
async function POST_PasswordRetrieve(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let logger = ctx.global.logger;

  let email = ctx.request.body.email;
  let captcha = ctx.request.body.captcha;
  let serverCaptcha = ctx.session.captcha;

  ctx.assert(email, 400, '@input:email is required.');
  ctx.assert(captcha, 400, '@input:captcha is required.');
  ctx.assert(serverCaptcha, 404, '@session:captcha is required.');

  let decode = await jwtVerify(`${serverCaptcha}`, SERVER_PRIVATE_KEY, jwtOptions('captcha', ctx.ip))
    .catch(err => {
      ctx.throw(409, err.message);
    });

  ctx.assert(captcha.toUpperCase() === decode.captcha.toUpperCase(), 406, 'Captcha doesn\'t match.');

  let res = await mysql.query({
    sql: 'SELECT a.uid FROM user_account AS a LEFT JOIN user_profile AS b ON a.uid=b.uid WHERE b.email=?',
    timeout: 10000
  }, [email]).catch(err => {
    throw err;
  });

  if (res.result.length > 0) {
    let uid = res.result[0].uid;
    let retrievePWCert = jwt.sign({ // 生成一个与ip绑定的认证
      uid: uid,
    }, SERVER_PRIVATE_KEY, jwtOptions('retrievePWCert', ctx.ip));

    let sessionKey = `u${uid}${base64urlEncode(generateSalt(16))}`; // 产生一个随机的key以隐藏token认证

    let template = fs.readFileSync("./server/mail/retrieve-password.template.html").toString();
    template = template.replace(
      /\$\{retrieveLink\}/g,
      `${ctx.protocol}://${ctx.host}/pages/retrieve_password_cb?retrievePWCert=${sessionKey}` // 重设密码页面
    ).replace("${contactLink}", `${ctx.protocol}://${ctx.host}/pages/contact_cs`); // 客服页面

    let mail = {
      from: `Hypethron ^_^<${mailerOption.auth.user}>`, // 发件人，默认为邮箱系统的登录账号
      to: email,
      subject: `账户安全中心-找回密码`,
      html: template
    };

    let mailID = await mailerSend(mail).catch(err => {
      ctx.throw(502, err.message);
    });

    logger.info(`${mailID} was sent to <${email}>, who ask for a password-retrieve-service.`);

    ctx.session[sessionKey] = retrievePWCert;

    ctx.body = {
      success: true
    }

  } else {
    ctx.throw(403, 'Email address doesn\'t valid or matched.');
  }

  ctx.session.captcha = null; // 清空验证码

  return next();
}


/**
 * 根据`retrievePWCert`的值从session中获得相应的jwt-token证明并验证身份，若通过则重设密码。
 * 操作后，200状态下retrievePWCert会被清除。
 * @input { password: $String, salt: $String, retrievePWCert: $String }
 * @need-session { @input[retrievePWCert]: <token@subject:retrievePWCert> => uid: $Int }
 * @output { success: $Boolean }
 * @throw { 404:session数据丢失, 409: session数据jwt检验不通过 }
 */
async function PATCH_PasswordRetrieve(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let logger = ctx.global.logger;

  let password = ctx.request.body.password;
  let salt = ctx.request.body.salt;
  let retrievePWCert = ctx.request.body.retrievePWCert;

  ctx.assert(password, 400, '@input:password is required.');
  ctx.assert(salt, 400, '@input:salt is required.');
  ctx.assert(retrievePWCert && typeof retrievePWCert === 'string', 400, '@input:retrievePWCert is required.');

  let retrievePWCertS = ctx.session[retrievePWCert]; // 取出重设密码的认证token

  ctx.assert(ctx.session[retrievePWCert], 404, '@session:retrievePWCert is undefined. Consider to regenerate it.');

  let decode = await jwtVerify(`${retrievePWCertS}`, SERVER_PRIVATE_KEY, jwtOptions('retrievePWCert', ctx.ip))
    .catch(err => {
      ctx.session[retrievePWCert] = null; // 清空过期或被篡改的数据
      ctx.throw(409, err.message);
    });

  let uid = decode.uid;

  let res = await mysql.query({
    sql: `UPDATE user_account SET password=?, salt=? WHERE uid=?`,
    timeout: 10000
  }, [hmac(SERVER_SALT, password, {alg: "md5", repeat: 1}), salt, uid]).catch(err => {
    throw err;
  });

  logger.info(`User[${uid}] reset his/her password. Affected-rows=${res.result.affectedRows > 0}`);// 写入日志

  ctx.body = {
    success: res.result.affectedRows > 0
  };

  ctx.session[retrievePWCert] = null; // 成功之后清除认证

  return next();
}


module.exports = {
  POST_PasswordRetrieve,
  PATCH_PasswordRetrieve
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
    expiresIn: "5m" // 5 分钟有效期
  }
}