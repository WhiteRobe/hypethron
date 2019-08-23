const {jwtVerify} = require('../../util/tools.js');
const {JWT_OPTIONS} = require('../../server-configure.js');

/***
 * @Router `ctx.params.{uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。
 */


/**
 * 查询用户的资料，权限为管理组或本人时可以跳过隐私设定获取数据。
 * @params { uid: $Int }
 * When `ctx.params.{uid}` = 0:
 *   @input { filter: $Values }
 *     => filter contains :
 *       page: $int, // 当前页(必填)；从1起
 *       max: $int, // 每页最大数据量(必填)；最大为50
 *       // 下面几项为可选项
 *       nickname: $String, // 支持模糊匹配
 *       sex: $String ['f', 'm', '?'],
 *       birthdayStart: $String, (含) -> 必须与 birthdayEnd 成对出现，否则不起效
 *       birthdayEnd: $String, (不含)
 *       company: $String, // 支持模糊匹配
 *       location: $String // 支持模糊匹配
 * Else:
 *   @input { / }
 * @input { <opt>only: $Array } 只获取规定字段的项
 * @output { result: $Array }
 * @throw { 409: 认证token的jwt检验不通过 }
 */
async function GET_userProfile(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let AUTH = ctx.AUTH;
  let ignorePrivacySetting = false;
  let uid = parseInt(ctx.params.uid) || 0; // 保证是个整数值

  ctx.assert(uid >= 0, 400, '@url-params:uid is invalid.');

  let token = ctx.header.Authorization;
  if (token) { // 本人或管理组可以跳过隐私设定
    let decode = await jwtVerify(token, jwtOptions(`authorization`, ctx.ip)).catch(err => {
      ctx.throw(409, err.message); // 若为过期TOKEN，抛出错误以给前台一个反馈
    });
    ignorePrivacySetting = (decode.authority & AUTH.ADMIN_GROUP) > 0 || decode.uid === uid;
  }

  if (uid > 0) { // 精确匹配模式
    let res = await mysql.query(
      {
        sql: `SELECT * FROM user_profile AS a LEFT JOIN user_privacy AS b ON a.uid=b.uid WHERE a.uid=?;`,
        timeout: 10000
      }, [uid]
    ).catch(err => {
      throw err;
    });

    ctx.body = {
      result: ignorePrivacySetting ? res.result : privacyBlock(res.result)
    };

  } else {
    let filter = ctx.request.query;

    ctx.assert(filter.page && filter.max, 400, "@input:page and @input:max is required.");

    let sql = '';
    let values = [];

    let map = {
      " AND nickname LIKE ? ": filter.nickname,
      " AND sex = ? ": filter.sex,
      " AND company LIKE ? ": filter.company,
      " AND location LIKE ? ": filter.location,
    };

    for (let i in map) {
      if (map[i] !== undefined) { // 非空的值就入栈
        sql += i;
        values.push(/LIKE \?/.test(i) ? `%${map[i]}%` : map[i]);
      }
    }

    if (filter.birthdayStart && filter.birthdayEnd) {
      sql += " AND (date_format(birthday, '%Y-%m-%d') BETWEEN ? AND ?) ";
      values.push(filter.birthdayStart);
      values.push(filter.birthdayEnd);
    }

    let res = await mysql.query(
      {
        sql: `SELECT * FROM user_profile AS a LEFT JOIN user_privacy AS b ON a.uid=b.uid WHERE true ${sql};`,
        timeout: 10000
      }, values
    ).catch(err => {
      throw err;
    });


    let totalHit = res.result.length;
    let returnResult = res.result.slice(filter.max * (filter.page - 1), Math.min(totalHit, filter.max * filter.page));
    ctx.body = {
      result: ignorePrivacySetting ? returnResult : onlyFilter(privacyBlock(returnResult), filter.only)
    };
  }

  return next();
}


/**
 * 更改用户的资料，权限需求为管理组或本人。
 * @params { uid: $Int }
 * @input { updateData: $Object } // 更改的值
 * @output { success: $Boolean }
 * @throw { 401: 缺少认证, 403: 权限不足, 409: 认证token的jwt检验不通过 }
 */
async function PATCH_userProfile(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let AUTH = ctx.AUTH;

  let uid = parseInt(ctx.params.uid) || 0; // 保证是个整数值

  ctx.assert(uid > 0, 400, '@url-params:uid should be positive.');


  let token = ctx.header.Authorization;

  ctx.assert(token, 401);

  let decode = await jwtVerify(token, jwtOptions(`authorization`, ctx.ip)).catch(err => {
    ctx.throw(409, err.message);
  });

  ctx.assert(
    (decode.authority & AUTH.ADMIN_GROUP) > 0 || decode.uid === uid, 403,
    {detail: "只有管理组或本人才能调取这个接口."}
  );

  let updateData = ctx.request.body.updateData;

  ctx.assert(updateData, 400, "@input:updateData is null.");

  let values = [];
  let sql = "";

  let map = {
    " nickname = ?,": updateData.nickname,
    " avatar_pic = ?,": updateData.avatarPic,
    " sex = ?,": updateData.sex,
    " birthday = ?,": updateData.birthday,
    " company = ?,": updateData.company,
    " location = ?,": updateData.location,
    " website = ?,": updateData.website,
    " biography = ?,": updateData.biography,
    //" phone = ?,": updateData.phone, (绑定内容，需验证)
    //" email = ?,": updateData.email (绑定内容，需验证)
  };

  for (let i in map) {
    if (map[i] !== undefined) { // 非空的值就入栈
      sql += i;
      values.push(map[i]);
    }
  }

  ctx.assert(values.length > 0, 400, "@input:updateData is an empty object.");

  values.push(uid);
  sql = sql.replace(/,$/, "");
  let res = await mysql.query({sql: `UPDATE user_profile SET ${sql} WHERE uid=?;`, timeout: 10000}, values)
    .catch(err => {
      throw err;
    });

  ctx.body = {
    success: res.result.affectedRows > 0
  };

  return next();
}


/**
 * 按隐私设定屏蔽部分内容，值与数据库表结构有关。 => user_account left-join user_privacy
 * @param result 结果集的Array( 含隐私设定 )
 */
function privacyBlock(result) {
  let secret = '因隐私设定而保密';
  for (let i of result) {
    // 利用掩码调整输出到前端的内容
    i.company = i.privacy_general === 1 ? i.company : secret;
    i.location = i.privacy_general === 1 ? i.location : secret;
    i.website = i.privacy_general === 1 ? i.website : secret;
    i.sex = i.privacy_sex === 1 ? i.sex : secret;
    i.birthday = i.privacy_birthday === 1 ? i.birthday : secret;
    i.phone = i.privacy_phone === 1 ? i.phone : secret;
    i.email = i.privacy_email === 1 ? i.email : secret;

    // 清空本接口的无关数据
    i.privacy_general = undefined;
    i.privacy_sex = undefined;
    i.privacy_birthday = undefined;
    i.privacy_phone = undefined;
    i.privacy_email = undefined;
  }
  return result;
}


/**
 * 按only中所列的字段进行过滤
 * @param result 结果集的Array
 * @param only 要留下的元素的字段Array
 * @return {Array}
 */
function onlyFilter(result, only) {
  let returnResult = [];
  if (!!only && only.length > 0) {
    for (let s of result) { // s:object
      for (let f in s) { // f:key
        let found = false;
        for (let n of only) {
          if (n.toUpperCase() === f.replace(/_/g, '').toUpperCase()) {
            found = true;
            break;
          }
        }
        if(!found){
          s[f] = undefined;
        }
      }
    }
  } else {
    returnResult = result;
  }
  return returnResult;
}

module.exports = {
  GET_userProfile,
  PATCH_userProfile
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