const {jwtVerify} = require('../../util/tools.js');
const {JWT_OPTIONS} = require('../../server-configure.js');

/***
 * @Router `ctx.params.{uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。
 */


/**
 * 获取某用户的各项隐私设定，权限需求为管理组或本人。
 * @params { uid: $Int }
 * @input { / }
 * @output { result: $Array }
 */
async function GET_userPrivacies(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let AUTH = ctx.AUTH;

  let uid = parseInt(ctx.params.uid) || 0; // 保证是个整数值

  ctx.assert(uid > 0, 400, "@params:uid should be positive.");

  let token = ctx.header.authorization;

  ctx.assert(token, 401);

  let decode = await jwtVerify(token, jwtOptions(`authorization`, ctx.ip)).catch(err => {
    ctx.throw(409, err.message);
  });

  ctx.assert(
    (decode.authority & AUTH.ADMIN_GROUP) > 0 || decode.uid === uid, 403,
    {detail: "只有管理组或本人才能调取这个接口."}
  );

  let res = await mysql.query('SELECT * FROM user_privacy WHERE uid=?;', [uid]).catch(err => {
    throw err;
  });

  ctx.body = {
    result: res.result
  };

  return next();
}

/**
 * 更改用户的隐私设定，权限需求为管理组或本人。
 * @params { uid: $Int }
 * @input { updateData: $Object } // 更改的值
 * @output { success: $Boolean }
 */
async function PATCH_userPrivacies(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let AUTH = ctx.AUTH;

  let uid = parseInt(ctx.params.uid) || 0; // 保证是个整数值

  ctx.assert(uid > 0, 400, "@params:uid should be positive.");

  let token = ctx.header.authorization;

  ctx.assert(token, 401);

  let decode = await jwtVerify(token, jwtOptions(`authorization`, ctx.ip)).catch(err => {
    ctx.throw(409, err.message);
  });

  ctx.assert(
    (decode.authority & AUTH.ADMIN_GROUP) > 0 || decode.uid === uid, 403,
    {detail: "只有管理组或本人才能调取这个接口."}
  );

  let updateData = ctx.request.body.updateData;

  ctx.assert(updateData, 400, "@params:updateData is null.");

  let values = [];
  let sql = "";

  let map = {
    " privacy_general = ?,": updateData.privacyGeneral,
    " privacy_sex = ?,": updateData.privacySex,
    " privacy_birthday = ?,": updateData.privacyBirthday,
    " privacy_phone = ?,": updateData.privacyPhone,
    " privacy_email = ?,": updateData.privacyEmail
  };

  for (let i in map) {
    if (map[i] !== undefined) { // 非空的值就入栈
      sql += i;
      values.push(map[i]);
    }
  }

  ctx.assert(values.length > 0, 400, "@params:updateData is an empty object.");

  values.push(uid);
  sql = sql.replace(/,$/, "");
  let res = await mysql.query({
    sql: `UPDATE user_privacy SET ${sql} WHERE uid=?;`,
    timeout: 10000
  }, values).catch(err => {
    throw err;
  });

  ctx.body = {
    success: res.result.affectedRows > 0
  };

  return next();
}

module.exports = {
  GET_userPrivacies,
  PATCH_userPrivacies
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