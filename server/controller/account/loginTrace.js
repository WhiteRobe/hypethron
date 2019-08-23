const {jwtVerify} = require('../../util/tools.js');
const {JWT_OPTIONS} = require('../../server-configure.js');


/**
 * 获取一个用户的登录轨迹
 * @need-head { Authorization: <token>@subject:authorization => { uid: $Int, authority: $Int } }
 * @input { / }
 * @output { trace: $Array }
 */
async function GET_loginTrace(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;

  let token = ctx.header.Authorization;
  ctx.assert(token, 401);

  let decode = await jwtVerify(token, jwtOptions(`authorization`, ctx.ip)).catch(err => {
    ctx.throw(409, err.message);
  });

  let _30daysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
    .toLocaleDateString().replace(/\//g, '-'); // 获取30天前的时间

  let res = await mysql.query({
    sql: `SELECT * FROM user_login_trace WHERE uid=? AND time_sign>?;`,
    timeout: 10000
  }, [decode.uid, _30daysAgo]).catch(err => {
    throw err;
  });

  ctx.body = {
    trace: res.result
  };

  return next();
}


/**
 * 记录一个用户当前的登录轨迹
 * @need-head { Authorization: <token>@subject:authorization => { uid: $Int, authority: $Int } }
 * @input { / }
 * @output { success: $Boolean }
 */
async function POST_loginTrace(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;

  let token = ctx.header.Authorization;
  ctx.assert(token, 401);

  let decode = await jwtVerify(token, jwtOptions(`authorization`, ctx.ip)).catch(err => {
    ctx.throw(409, err.message);
  });

  let uid = decode.uid;
  let timeSign = new Date().toLocaleDateString().replace(/\//g, '-'); // 获取当前时间

  let alreadySigned = false;
  let res = await mysql.query({
    sql: `INSERT INTO user_login_trace(uid, time_sign) VALUES(?, ?)`,
    timeout: 10000
  }, [timeSign, uid]).catch(err => {
    if (err.errno === 1062 /*|| err.code === `ER_DUP_ENTRY`*/) { // 今天已经标记过本次登录了
      alreadySigned = true; // 即`ER_DUP_ENTRY` @See https://dev.mysql.com/doc/refman/5.5/en/server-error-reference.html
    } else {
      throw err;
    }
  });

  ctx.body = {
    success: res.result.affectedRows > 0 || alreadySigned
  };

  return next();
}

module.exports = {
  GET_loginTrace,
  POST_loginTrace
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