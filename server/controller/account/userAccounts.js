const {SERVER_PRIVATE_KEY, JWT_OPTIONS, SERVER_SALT} = require('../../server-configure.js');
const {global, RES_MSG, AUTH} = require('../../util/global.js');
const {hmac} = require('../../util/crypto-hash-tool.js');
const jwt = require('jsonwebtoken'); // @See https://www.npmjs.com/package/jsonwebtoken
const {jwtVerify, isJwtError} = require('../../util/tools.js');


/***
 * @Router `ctx.params.{uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。
 */


/**
 * RESTful 用户查询，返回用户的账户信息，对权限有要求。当uid=0时通过过滤模式筛选所有符合要求的人信息
 * When `ctx.params.{uid}` = 0:
 *  @input { filter: $Values }
 *    => filter contains :
 *      page: $int, // 当前页(必填)；从1起
 *      max: $int, // 每页最大数据量(必填)；最大为50
 *      // 下面两项至少需要一项
 *      username: $String, // 用户的 username 或 email 或 phone 或openid (支持模糊检索)
 *      authority: $int, // 目标用户权限
 * Else:
 *  @input { / }
 * @output { result:$Array }
 */
async function GET_userAccounts(ctx, next) {
  let mysql = global.mysqlPoolDM;
  let logger = global.logger;

  try {
    let uid = ctx.params.uid;
    let token = ctx.header.authorization;
    let decode = await jwtVerify(token).catch(err => {
      throw err;
    });

    if ((decode.authority & (AUTH.USER_DATA_ANALYSIS | AUTH.ADMIN_GROUP)) <= 0) {
      throw new RangeError("只有管理组和用户数据分析师才能调取这个接口.");
    }

    if (uid > 0) { // 精确筛选模式
      let res = await mysql.query(
        'SELECT * FROM user_account WHERE uid=?;', [uid]
      ).catch(err => {
        throw err;
      });
      ctx.body = {
        result: res.result,
        msg: RES_MSG.OK
      };
    } else {
      let filter = ctx.request.query;

      if (!(filter.username || filter.authority) || !filter.page || !filter.max) {
        throw new TypeError("username和authority至少需要一项;page和max必填！");
      }

      let values = [];
      let sql = 'true';
      if (filter.username) {
        sql += ' AND (a.username LIKE ? or a.openid LIKE ? or b.email LIKE ? or b.phone LIKE ?)';
        for (let i = 0; i < 4; i++) values.push(`%${filter.username}%`);
      }

      if (filter.authority) {
        values.push(filter.authority);
        sql += ' AND a.authority = ? ';
      }

      let res = await mysql.query(
        `SELECT a.* FROM user_account AS a LEFT JOIN user_profile AS b ON a.uid=b.uid WHERE ${sql};`, values
      ).catch(err => {
        throw err;
      });

      let totalHit = res.result.length;
      filter.max = Math.min(parseInt(filter.max) || 0, 50); // 非数字值将被转化为0
      filter.page = parseInt(filter.page) || 0;

      ctx.body = { // 返回结果
        result: res.result.slice(filter.max * (filter.page - 1), Math.min(totalHit, filter.max * filter.page)),
        msg: RES_MSG.OK
      };
    }
  } catch (err) {
    if (isJwtError(err)) {
      ctx.body = {
        msg: RES_MSG.JWT_TOKEN_INVALID,
        errorDetail: err.message // jwt error. @See https://www.npmjs.com/package/jsonwebtoken#errors--codes
      }
    } else if (err instanceof RangeError) { // 权限不足
      ctx.body = {
        msg: RES_MSG.AUTH_LOW,
        errorDetail: `${RES_MSG.AUTH_LOW}:${err.message}`
      }
    } else if (err instanceof TypeError) { // 参数不足
      ctx.body = {
        msg: RES_MSG.MISS_PARAMS,
        errorDetail: `${RES_MSG.MISS_PARAMS}:${err.message}`
      }
    } else {
      logger.error(err);
      ctx.body = {
        msg: RES_MSG.DATABASE_ERROR,
        errorDetail: err.code + ":" + err.message // mysql error. @See https://www.npmjs.com/package/mysql#error-handling
      }
    }
  }
  return next();
}

/**
 * RESTful 注册接口，返回一个注册是否成功的标志和服务器签发的Token。When do POST, response on ".../userAccounts/0"
 * 需要`ctx.session.emailForBind`、`ctx.session.captchaForBind`。
 * @input { username: $String, password: $String, salt: $String, captcha: $String }
 * @output { success: $Boolean, token: $String }
 */
async function POST_userAccounts(ctx, next) {
  let mysql = global.mysqlPoolDM;
  let logger = global.logger;

  let username = ctx.request.body.username; // 用以登录的用户名
  let password = ctx.request.body.password; // 经过前端慢计算的哈希密码
  let salt = ctx.request.body.salt; // 慢计算用盐

  let email = ctx.session.emailForBind; // 绑定的邮箱名(此时默认email已从邮箱绑定接口注册到session中)
  let captchaServer = ctx.session.captchaForBind; // 注册时的验证码(服务端) 应为6位字符长
  let captchaClient = ctx.request.body.captcha; // 注册时的验证码(客户端)

  try {
    if (!email || !captchaClient || captchaServer !== captchaClient) {
      throw new RangeError("参数不足或验证码不匹配！");
    }

    let connection = await mysql.beginTransaction().catch(err => {// 获取一个事务实例
      throw err;
    });

    try { // 开始进行事务

      let usersCount = await connection.query( // 事务回滚会导致AUTO_INCREMENT产生间隙，这里手动对UID进行修正
        'SELECT COUNT(*) as total, MAX(uid) as maxUid FROM user_account' // 尽管这样可能会导致并发注册请求的某些问题
      ).catch(err => {
          throw err;
        }
      );

      let nextUid = Math.max(usersCount.result[0].total, usersCount.result[0].maxUid) + 1; // 中间因DEL等造成的间隙直接放弃

      await connection.query( // 插入用户账户表
        'INSERT INTO user_account(uid, username, password, salt) values (?, ?, ?, ?);',
        [nextUid, username, hmac(SERVER_SALT, password, {alg: "md5", repeat: 1}), salt]
      ).catch(err => {
          throw err;
        }
      );

      let res = await connection.query( // 获取刚刚插入的用户的各项信息
        'SELECT * FROM user_account WHERE username=?;', [username]
      ).catch(err => {
          throw err;
        }
      );

      if (res.result.length > 0) {
        await connection.query( // 创建级联表:用户信息表
          'INSERT INTO user_profile(uid, nickname, email) values (?, ?, ?);',
          [res.result[0].uid, `${username}(${res.result[0].uid})`, email]
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
        };

        // 清空session
        ctx.session.emailForBind = null;
        ctx.session.captchaForBind = null;
      } else {
        ctx.body = { // 注册失败
          success: false,
          token: "",
          msg: RES_MSG.FAIL,
          errorDetail: "注册失败，未知原因。"
        };
      }
    } catch (e) {
      await connection.rollback() // 发生错误则事务回撤
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
    if (err instanceof RangeError) {
      ctx.body = {
        success: false,
        token: "",
        msg: RES_MSG.CAPTCHA_MISS_MATCH,
        errorDetail: RES_MSG.CAPTCHA_MISS_MATCH + ":" + err.message // mysql error. @See https://www.npmjs.com/package/mysql#error-handling
      }
    } else {
      logger.error(err);
      ctx.body = {
        success: false,
        token: "",
        msg: RES_MSG.DATABASE_ERROR,
        errorDetail: err.code + ":" + err.message // mysql error. @See https://www.npmjs.com/package/mysql#error-handling
      }
    }
  }
  return next();
}

/**
 * RESTful 完全更改用户账户信息表的接口，对权限有要求。返回操作是否成功的标志。`ctx.params.{uid}` 为要更改的账号的UID。
 * @input { data: $Object => '{ username:$String,  openid:$String, password:$String, salt:$String, authority:$Integer }' }
 * @output { success: $Boolean }
 */
async function PUT_userAccounts(ctx, next) {
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

    let data = ctx.request.body;
    if (!data.openid || !data.password || !data.salt || !data.authority) {
      throw new TypeError("缺失必要的参数，请尝试调用PATCH动作.");
    }

    let sql = '';
    let values = [data.openid, hmac(SERVER_SALT, data.password, {
      alg: "md5",
      repeat: 1
    }), data.salt];

    if ((decode.authority & AUTH.SUPER_ADMIN) > 0) { // 只有超管才能改权限
      sql = ', authority=?';
      values.push(data.authority);
    }

    values.push(uid);
    let res = await mysql.query(
      `UPDATE user_account SET openid=?, password=?, salt=? ${sql} WHERE uid=?;`, values
    ).catch(err => {
      throw err;
    });

    if (res.result.affectedRows > 0) { // 更新成功
      ctx.body = {
        success: true,
        msg: RES_MSG.OK
      };
    } else {
      ctx.body = {
        success: false,
        msg: RES_MSG.FAIL,
        errorDetail: `${RES_MSG.FAIL}:更新用户账户表失败，请检查 UID=${uid} 的值是否正确。`
      };
    }
  } catch (err) {
    if (err instanceof RangeError) { // 权限不足
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

/**
 * RESTful 部分更改用户账户信息表的接口，对权限有要求。返回操作是否成功的标志。`ctx.params.{uid}` 为要更改的账号的UID。
 * @input {data: $Object => '{ username:$String, openid:$String, password:$String, salt:$String, authority:$Integer }'}
 * @output { success: $Boolean }
 */
async function PATCH_userAccounts(ctx, next) {
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

    let data = ctx.request.body;
    if (!(data.openid || data.password || data.salt || data.authority)) {
      throw new TypeError("缺失必要的参数，请至少填入一个需要更新的值.");
    }


    let values = [];
    let sql = '';
    let map = {
      " openid = ?,": data.openid,
      " password = ?,": data.password ? hmac(SERVER_SALT, data.password, {alg: "md5", repeat: 1}) : undefined,
      " salt = ?,": data.salt,
      " authority = ?,": (decode.authority & AUTH.SUPER_ADMIN) > 0 ? data.authority : undefined, // 只有超管才能改权限
    };

    for (let i in map) {
      if (map[i] !== undefined) { // 非空的值就入栈
        sql += i;
        values.push(map[i]);
      }
    }

    sql = sql.replace(/,$/, ""); // 移除末尾的逗号
    values.push(uid);
    let res = await mysql.query(`UPDATE user_account SET ${sql} WHERE uid=?;`, values).catch(err => {
      throw err
    });

    if (res.result.affectedRows > 0) { // 更新成功
      ctx.body = {
        success: true,
        msg: RES_MSG.OK
      };
    } else {
      ctx.body = {
        success: false,
        msg: RES_MSG.FAIL,
        errorDetail: `${RES_MSG.FAIL}:更新用户账户表失败，请检查 UID=${uid} 的值是否正确。`
      };
    }
  } catch (err) {
    if (err instanceof RangeError) { // 权限不足
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

/**
 * RESTful 删除用户账户信息表(及级联表)的接口，对权限有要求。返回操作是否成功的标志。`ctx.params.{uid}` 为要删除账号的UID。
 * @input { / }
 * @output { success: $Boolean }
 */
async function DELETE_userAccounts(ctx, next) {
  let mysql = global.mysqlPoolDM;
  let logger = global.logger;

  try {
    let uid = ctx.params.uid;
    let token = ctx.header.authorization;
    let decode = await jwtVerify(token).catch(err => {
      throw err;
    });

    if ((decode.authority & AUTH.ADMIN_GROUP) <= 0) {
      throw new RangeError("只有管理组才能调取这个接口.");
    }

    let connection = await mysql.beginTransaction().catch(err => {// 获取一个事务实例
      throw err;
    });

    try {
      // 删除所有关联表
      let tables = ['user_privacy', 'user_profile', 'user_account'];
      for (let table of tables) {
        await mysql.query(`DELETE FROM ${table} WHERE uid=?`, [uid]).catch(err => {
          throw err;
        })
      }

      await connection.commit().catch(err => { // 尝试确认更改
        throw err
      });

      ctx.body = { // 移除成功
        success: true,
        msg: RES_MSG.OK
      };

    } catch (e) {
      await connection.rollback() // 发生错误则事务回撤
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

module.exports = {
  GET_userAccounts,
  POST_userAccounts,
  PUT_userAccounts,
  PATCH_userAccounts,
  DELETE_userAccounts
};