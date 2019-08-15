const {global, RES_MSG, AUTH} = require('../../util/global.js');
const {jwtVerify, isJwtError} = require('../../util/tools.js');


/***
 * @Router `ctx.params.{uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。
 */


/**
 * 获取某用户的各项隐私设定，权限需求为管理组或本人。`ctx.params.{uid}`。
 * @input { / }
 * @output { result: $Array }
 */
async function GET_userPrivacies(ctx, next) {
  let mysql = global.mysqlPoolDM;
  let logger = global.logger;

  let uid = parseInt(ctx.params.uid) || 0; // 保证是个整数值

  try {

    let token = ctx.header.authorization;
    let decode = await jwtVerify(token).catch(err => {
      throw err;
    });

    if ((decode.authority & AUTH.ADMIN_GROUP) <= 0 && decode.uid !== uid) {
      throw new RangeError("只有管理组或本人才能调取这个接口.");
    }

    let res = await mysql.query('SELECT * FROM user_privacy WHERE uid=?;', [uid]).catch(err => {
      throw err;
    });

    ctx.body = {
      result: res.result,
      msg: RES_MSG.OK
    };

  } catch (err) {
    if (err instanceof RangeError) { // 权限不足
      ctx.body = {
        success: false,
        msg: RES_MSG.AUTH_LOW,
        errorDetail: `${RES_MSG.AUTH_LOW}:${err.message}`
      }
    } else {
      logger.error(err);
      ctx.body = {
        success: false,
        msg: RES_MSG.DATABASE_ERROR,
        errorDetail: err.code + ":" + err.message // mysql error. @See https://www.npmjs.com/package/mysql#error-handling
      }
    }
  }

  return next();
}

/**
 * 更改用户的隐私设定，权限需求为管理组或本人。`ctx.params.{uid}`。
 * @input { updateData: $Object } // 更改的值
 * @output { success: $Boolean }
 */
async function PATCH_userPrivacies(ctx, next) {
  let mysql = global.mysqlPoolDM;
  let logger = global.logger;

  let uid = parseInt(ctx.params.uid) || 0; // 保证是个整数值

  try {

    let token = ctx.header.authorization;
    let decode = await jwtVerify(token).catch(err => {
      throw err;
    });

    if ((decode.authority & AUTH.ADMIN_GROUP) <= 0 && decode.uid !== uid) {
      throw new RangeError("只有管理组或本人才能调取这个接口.");
    }

    let updateData = ctx.request.body.updateData;

    if (!updateData) {
      throw new TypeError("缺失必要的参数，请至少填入一个需要更新的值.");
    }

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

    values.push(uid);
    sql = sql.replace(/,$/, "");
    let res = await mysql.query(`UPDATE user_privacy SET ${sql} WHERE uid=?;`, values).catch(err => {
      throw err;
    });

    ctx.body = {
      success: res.result.affectedRows > 0,
      msg: RES_MSG.OK
    };

  } catch (err) {
    if (isJwtError(err)) {
      ctx.body = {
        success: false,
        msg: RES_MSG.JWT_TOKEN_INVALID,
        errorDetail: `${RES_MSG.JWT_TOKEN_INVALID}:${err.message}`
      }
    } else if (err instanceof RangeError) { // 权限不足
      ctx.body = {
        success: false,
        msg: RES_MSG.AUTH_LOW,
        errorDetail: `${RES_MSG.AUTH_LOW}:${err.message}`
      }
    } else if (err instanceof TypeError) { // 缺失参数
      ctx.body = {
        success: false,
        msg: RES_MSG.MISS_PARAMS,
        errorDetail: `${RES_MSG.MISS_PARAMS}:${err.message}`
      }
    } else {
      logger.error(err);
      ctx.body = {
        success: false,
        msg: RES_MSG.DATABASE_ERROR,
        errorDetail: err.code + ":" + err.message // mysql error. @See https://www.npmjs.com/package/mysql#error-handling
      }
    }
  }

  return next();
}

module.exports = {
  GET_userPrivacies,
  PATCH_userPrivacies
};