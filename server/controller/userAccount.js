const {SERVER_PRIVATE_KEY, JWT_OPTIONS, SERVER_SALT} = require('../server-configure.js');
const {global, RES_MSG} = require('../util/global.js');
const {hmac} = require('../util/crypto-hash-tool.js');
const jwt = require('jsonwebtoken'); // @See https://www.npmjs.com/package/jsonwebtoken

async function GET_userAccount(ctx, next) {
  return next();
}

/**
 * RESTful 注册接口，返回一个注册是否成功的标志和服务器签发的Token
 * @input { username: $String, account: $String,  password:$String, salt:$String }
 * @output { success: $Boolean, token: $String }
 */
async function POST_userAccount(ctx, next) {
  let mysql = global.mysqlPoolDM;
  let logger = global.logger;

  let username = ctx.request.body.username; // 用以登录的用户名
  let account = ctx.request.body.account; // 用以登录的账号名
  let password = ctx.request.body.password; // 经过前端慢计算的哈希密码
  let salt = ctx.request.body.salt; // 慢计算用盐

  try {
    let connection = await mysql.beginTransaction().catch( err => {// 获取一个事务实例
      throw err;
    });

    try { // 开始进行事务

      let usersCount = await connection.query( // 事务会导致AUTO_INCREMENT产生间隙，这里手动对UID进行修正
        'SELECT COUNT(*) as total FROM user_account' // 这样可能会导致并发注册请求的某些问题
      ).catch(err => {
          throw err;
        }
      );

      await connection.query( // 插入用户账户表
        'INSERT INTO user_account(uid, username, account, password, salt) values (?, ?, ?, ?, ?);',
        [usersCount.result[0].total + 1, username, account, hmac(SERVER_SALT, password, {alg: "md5", repeat: 1}), salt]
      ).catch(err => {
          throw err;
        }
      );

      let res = await connection.query( // 获取刚刚插入的用户的各项信息
        'SELECT * FROM user_account WHERE username=? and account=?;', [username, account]
      ).catch(err => {
          throw err;
        }
      );

      if (res.result.length > 0) {
        await connection.query( // 创建级联表:用户信息表
          'INSERT INTO user_profile(uid, nickname) values (?, ?);',
          [res.result[0].uid, `${username}(${res.result[0].uid})`]
        ).catch(err => {
          throw err;
        });

        await connection.query( // 创建级联表:用户隐私表
          'INSERT INTO user_privacy(uid) values (?);', [res.result[0].uid]
        ).catch(err => {
          throw err;
        });

        await connection.commit().catch(err => {
          throw err
        });

        ctx.body = { // 注册成功，签发Token {uid, authority}
          success: true,
          token: jwt.sign({
            uid: res.result[0].uid,
            authority: res.result[0].authority
          }, SERVER_PRIVATE_KEY, JWT_OPTIONS),
          msg: RES_MSG.OK
        }
      } else {
        ctx.body = { // 注册失败
          success: false,
          token: "",
          msg: RES_MSG.FAIL,
          errorDetail: "注册失败，未知原因。"
        };
      }
    } catch (e) {
      connection.rollback() // 发生错误则事务回撤
        .catch(err => {
          throw err;
        })
        .finally(() => {
          throw e;
        });
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(err);
    ctx.body = {
      success: false,
      token: "",
      msg: RES_MSG.DATABASE_ERROR,
      errorDetail: err.code + ":" + err.message // mysql error. @See https://www.npmjs.com/package/mysql#error-handling
    }
  }
  return next();
}


async function PUT_userAccount(ctx, next) {
  return next();
}

async function PATCH_userAccount(ctx, next) {
  return next();
}

async function DELETE_userAccount(ctx, next) {
  return next();
}

module.exports = {
  GET_userAccount,
  POST_userAccount,
  PUT_userAccount,
  PATCH_userAccount,
  DELETE_userAccount
};