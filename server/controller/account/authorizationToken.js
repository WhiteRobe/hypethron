const jwt = require('jsonwebtoken'); // @See https://www.npmjs.com/package/jsonwebtoken
const {SERVER_PRIVATE_KEY, JWT_OPTIONS, SERVER_SALT} = require('../../server-configure.js');
const {hmac} = require('../../util/crypto-hash-tool.js');


/**
 * 通过账号进行登录，返回一个登录是否成功的标志即服务器签发的Token，并尝试写入cookies。
 * 同时，username可作为email或phone登录。
 * @input { username: $String, password: $String, salt:$String, newSalt:$String, newPassword:$String }
 * @set-cookies { @Authorization: authorizationToken }
 * @output { token: $String }
 */
async function POST_authorizationToken(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let logger = ctx.global.logger;

  let username = ctx.request.body.username; // 用以登录的用户名
  let password = ctx.request.body.password; // 经过前端慢计算的哈希密码
  let salt = ctx.request.body.salt; // 慢计算用盐
  let newPassword = ctx.request.body.newPassword;
  let newSalt = ctx.request.body.newSalt;

  ctx.assert(username, 400, `@params:username is required.`);
  ctx.assert(password, 400, `@params:password is required.`);
  ctx.assert(salt, 400, `@params:salt is required.`);
  ctx.assert(newPassword, 400, `@params:newPassword is required.`);
  ctx.assert(newSalt, 400, `@params:newSalt is required.`);

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
    }, SERVER_PRIVATE_KEY, JWT_OPTIONS);

    ctx.body = {
      token: jwt.sign({uid: res.result[0].uid, authority: res.result[0].authority}, SERVER_PRIVATE_KEY, JWT_OPTIONS)
    };

    logger.info(`${res.result[0].uid} login with password:${password} ${salt}.`);

    // 尝试写入cookies
    try {
      ctx.cookies.set('Authorization', authorizationToken, {maxAge: 7 * 24 * 60 * 60 * 1000/*7 days*/, signed: true});
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