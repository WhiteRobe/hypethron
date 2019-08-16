const {jwtVerify, isJwtError} = require('../../util/tools.js');
const {TokenExpiredError} = require('jsonwebtoken');


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
 * @output { result:$Array }
 */
async function GET_userProfile(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let AUTH = ctx.AUTH;
  let ignorePrivacySetting = false;
  let uid = parseInt(ctx.params.uid) || 0; // 保证是个整数值

  ctx.assert(uid >= 0, 400, '@params:uid is invalid.');

  let token = ctx.header.authorization;
  if (token) { // 本人或管理组可以跳过隐私设定
    let decode = await jwtVerify(token).catch(err => {
      if (err instanceof TokenExpiredError) {
        throw err; // 若为过期TOKEN，抛出错误以给前台一个反馈
      } else {
        ignorePrivacySetting = false;
      }
    });
    ignorePrivacySetting = (decode.authority & AUTH.ADMIN_GROUP) <= 0 && decode.uid !== uid;
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

    ctx.assert(filter.page && filter.max, 400, "@params:page and @params:max is required.");

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
      result: ignorePrivacySetting ? returnResult : privacyBlock(returnResult)
    };
  }

  return next();
}


/**
 * 更改用户的资料，权限需求为管理组或本人。
 * @params { uid: $Int }
 * @input { updateData: $Object } // 更改的值
 * @output { success: $Boolean }
 */
async function PATCH_userProfile(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let AUTH = ctx.AUTH;

  let uid = parseInt(ctx.params.uid) || 0; // 保证是个整数值

  ctx.assert(uid > 0, 400, '@params:uid should be positive.');


  let token = ctx.header.authorization;
  let decode = await jwtVerify(token).catch(err => {
    throw err;
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

  ctx.assert(values.length > 0, 400, "@params:updateData is an empty object.");

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
  for (let i of result) {
    // 利用掩码调整输出到前端的内容
    i.company = i.privacy_general === 1 ? i.company : '保密';
    i.location = i.privacy_general === 1 ? i.location : '保密';
    i.website = i.privacy_general === 1 ? i.website : '保密';
    i.sex = i.privacy_sex === 1 ? i.sex : '保密';
    i.birthday = i.privacy_birthday === 1 ? i.birthday : '保密';
    i.phone = i.privacy_phone === 1 ? i.phone : '保密';
    i.email = i.privacy_email === 1 ? i.email : '保密';

    // 清空本接口的无关数据
    i.privacy_general = undefined;
    i.privacy_sex = undefined;
    i.privacy_birthday = undefined;
    i.privacy_phone = undefined;
    i.privacy_email = undefined;
  }
  return result;
}


module.exports = {
  GET_userProfile,
  PATCH_userProfile
};