const {global, RES_MSG} = require('../../util/global.js');

// const {generateSalt} = require('../util/crypto-hash-tool.js');

/**
 * 输入一个userEmail，返回一个该userEmail是否存在的标志。
 * @input { userEmail: $String }
 * @output { exists: $Boolean }
 */
async function GET_userEmail(ctx, next) {
  let mysql = global.mysqlPoolDM;
  let logger = global.logger;
  let userEmail = ctx.request.query.userEmail;
  try {

    let cb = await mysql.query(
      'SELECT email FROM user_profile WHERE email=? ;', [userEmail]
    ).catch(err => {
      throw err
    });

    if (cb.result.length > 0) {
      ctx.body = {
        exists: true,
        msg: RES_MSG.OK
      }
    } else {
      ctx.body = {
        exists: false,
        msg: RES_MSG.OK
      }
    }

  } catch (err) {
    logger.error(err);
    ctx.body = {
      exists: false,
      salt: null, // ，节约服务器计算成本
      msg: RES_MSG.DATABASE_ERROR,
      errorDetail: err.code + ":" + err.message // mysql error. @See https://www.npmjs.com/package/mysql#error-handling
    }
  }

  return next();
}

module.exports = {
  GET_userEmail
};