/**
 * 登录接口特殊，不符合RESTful的设计规范
 */

const jwt = require('jsonwebtoken'); // @See https://www.npmjs.com/package/jsonwebtoken
const { SERVER_PRIVATE_KEY, JWT_OPTIONS, SERVER_SALT } = require('../server-configure.js');
const { global, RES_MSG } = require('../util/global.js');
const { hmac } =  require('../util/crypto-hash-tool.js');


/**
 * 通过账号进行登录，返回一个登录是否成功的标志和服务器签发的Token
 * @input { username: $String, password: $String,  }
 * @output { success: $Boolean, token: $String }
 */
async function POST_login(ctx, next) {
  let mysql = global.mysqlPool;
  let logger = global.logger;

  let username = ctx.request.body.username; // 用以登录的账号名
  let password = ctx.request.body.password; // 经过前端慢计算的哈希密码
  let salt = ctx.request.body.salt; // 慢计算用盐

  try {
    let result = await new Promise((resolve, reject) => {
      mysql.query('SELECT * FROM user_account WHERE (username=? or account=?) and password=? and salt=?;',
        [username, username, hmac(SERVER_SALT, password, {alg: "md5", repeat:1}), salt], (err, res, fields) => {
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
      // 匹配成功，尝试更新用户的盐和密码
      let newPassword = hmac(SERVER_SALT, ctx.request.body.newPassword, {alg: "md5", repeat:1});
      let newSalt = ctx.request.body.newSalt;
      await new Promise((resolve, reject) => {
        mysql.query('UPDATE user_account SET password=?, salt=? WHERE uid=?',
          [newPassword, newSalt, result[0].uid], (err, res, fields) => {
            if (err) {
              logger.error(err);
              // reject(err);
              throw err;
            } else {
              resolve(res);
            }
          });
      });

      // 登录成功，签发Token {uid, authority}
      ctx.body = {
        success: true,
        token: jwt.sign({uid: result[0].uid, authority: result[0].authority}, SERVER_PRIVATE_KEY, JWT_OPTIONS),
        msg: RES_MSG.OK
      };
    } else {
      ctx.body = {
        success: false,
        token: "",
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
  POST_login
};