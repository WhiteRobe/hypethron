const jwt = require('jsonwebtoken'); // @See https://www.npmjs.com/package/jsonwebtoken
const {SERVER_PRIVATE_KEY, JWT_OPTIONS, SERVER_SALT} = require('../../server-configure.js');
const {hmac} = require('../../util/crypto-hash-tool.js');
const {jwtVerify} = require('../../util/tools.js');

/**
 * 通过账号进行登录，返回一个登录是否成功的标志即服务器签发的Token，并尝试写入cookies。
 * 同时，username可作为email或phone登录。
 * 每次调用都会清空session里的captcha。
 * @input { username: $String, password: $String, salt:$String, newSalt:$String, newPassword:$String, captcha: $String }
 * @set-cookies { Authorization: <token>@subject:authorization => { uid: $Int, authority: $Int } }
 * @output { token: $String }
 * @throw {403: 认证不通过, 404:session数据丢失, 406: 验证码不匹配, 409: session验证码jwt检验不通过 }
 */
async function POST_authorizationToken(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let logger = ctx.global.logger;

  let username = ctx.request.body.username; // 用以登录的用户名
  let password = ctx.request.body.password; // 经过前端慢计算的哈希密码
  let salt = ctx.request.body.salt; // 慢计算用盐
  let newPassword = ctx.request.body.newPassword; // 下一次登录时的哈希密码
  let newSalt = ctx.request.body.newSalt; // 下一次登录时的盐
  let captcha = ctx.request.body.captcha;
  let captchaServer = ctx.session.captcha;

  ctx.assert(username, 400, `@input:username is required.`);
  ctx.assert(password, 400, `@input:password is required.`);
  ctx.assert(salt, 400, `@input:salt is required.`);
  ctx.assert(newPassword, 400, `@input:newPassword is required.`);
  ctx.assert(newSalt, 400, `@input:newSalt is required.`);
  ctx.assert(captcha, 400, '@input:captcha is required.');
  ctx.assert(captchaServer, 404, '@session:captcha is undefined. Consider to regenerate it.');

  let decode = await jwtVerify(captchaServer, SERVER_PRIVATE_KEY, jwtOptions('captcha', ctx.ip))
    .catch(err => {
      ctx.session.captcha = null; // 清空过期或被篡改的数据
      ctx.throw(409, err.message);
    });

  ctx.session.captcha = null; // 无论本次操作成功或失败清空已被使用的数据
  ctx.assert(captcha.toUpperCase() === decode.captcha.toUpperCase(), 406, 'Captcha doesn\'t match!'); // 比对验证码

  let res = await mysql.query(
    {
      sql: 'SELECT a.* FROM user_account AS a LEFT JOIN user_profile AS b ON a.uid=b.uid' +
        ' WHERE (a.username=? or b.email=? or b.phone=?) and password=? and salt=?;', timeout: 10000
    },
    [username, username, username, hmac(SERVER_SALT, password, {alg: "md5", repeat: 1}), salt]
  ).catch(err => {
    throw err;
  });

  if (res.result.length > 0) {
    // 匹配成功，尝试更新用户的盐和密码

    await mysql.query(
      {sql: 'UPDATE user_account SET password=?, salt=? WHERE uid=?', timeout: 10000},
      [hmac(SERVER_SALT, newPassword, {alg: "md5", repeat: 1}), newSalt, res.result[0].uid]
    ).catch(err => {
      throw err;
    });

    // 登录成功，签发Token {uid, authority}
    let authorizationToken = jwt.sign({
      uid: res.result[0].uid,
      authority: res.result[0].authority
    }, SERVER_PRIVATE_KEY, jwtOptions('authorization', ctx.ip));

    ctx.body = {
      token: authorizationToken
    };

    logger.info(`${res.result[0].uid} login with ip:${ctx.ip}.`);

    // 尝试写入cookies
    try {
      ctx.cookies.set('Authorization', authorizationToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000 /*7 days*/,
        signed: false,
        overwrite: true,
        httpOnly: false
      });
    } catch (e) {
      /*ignore err*/
    }

  } else {
    ctx.throw(403);
  }

  return next();
}

module.exports = {
  POST_authorizationToken
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
    expiresIn: "7d" // 7 天
  }
}