// const {generateSalt} = require('../util/crypto-hash-tool.js');

/**
 * 输入一个username，返回一个该username是否存在的标志。
 * @input { username: $String }
 * @output { exists: $Boolean }
 */
async function GET_usernameExistence(ctx, next) {
  let global = ctx.global;
  let mysql = global.mysqlPoolDM;
  let username = ctx.request.query.username;

  ctx.assert(username, 400, '@input:username is required.');

  let cb = await mysql.query(
    {sql: 'SELECT username FROM user_account WHERE username=? ;', timeout: 10000}, [username]
  ).catch(err => {
    throw err;
  });

  ctx.body = {
    exists: cb.result.length > 0
  };

  return next();
}

module.exports = {
  GET_usernameExistence
};