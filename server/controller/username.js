const {global, RES_MSG} = require('../util/global.js');
// const {generateSalt} = require('../util/crypto-hash-tool.js');

/**
 * 输入一个username，返回一个该username是否存在的标志和相应的salt：
 * @input { username: $String }
 * @output { exists: $Boolean, salt: $String }
 */
async function GET_username(ctx, next) {
  let mysql = global.mysqlPool;
  let logger = global.logger;
  let username = ctx.request.query.username;
  try {
    let result = await new Promise((resolve, reject) => {
      mysql.query('SELECT salt FROM user_account WHERE username=? or account=? ', [username, username], (err, res, fields) => {
        if (err) {
          logger.error(err);
          // reject(err);
          throw err;
        } else {
          resolve(res);
        }
      });
    });

    if (result.length > 0) {
      ctx.body = {
        exists: true,
        salt: result[0].salt,
        //newSalt: generateSalt(16), // 改由前端生成，节约服务器计算成本
        msg: RES_MSG.OK
      }
    } else {
      ctx.body = {
        exists: false,
        salt: null, // ，节约服务器计算成本
        //newSalt: generateSalt(16), // 改由前端生成，节约服务器计算成本
        msg: RES_MSG.OK
      }
    }

  } catch (err) {
    ctx.body = {
      msg: RES_MSG.DATABASE_ERROR,
      errorDetail: err.code+":"+err.message // mysql error. @See https://www.npmjs.com/package/mysql#error-handling
    }
  }

  return next();
}

module.exports = {
  GET_username
};