// const {generateSalt} = require('../util/crypto-hash-tool.js');

/**
 * 输入一个username，返回一个该username是否存在的标志和相应的salt。
 * @input { username: $String }
 * @output { exists: $Boolean, salt: $String }
 */
async function GET_usernameExistence(ctx, next) {
  let global = ctx.global;
  let mysql = global.mysqlPoolDM;
  let username = ctx.request.query.username;

  ctx.assert(username, 400, '@input:username is required.');

  let cb = await mysql.query(
    {sql: 'SELECT salt FROM user_account WHERE username=? ;', timeout: 10000}, [username]
  ).catch(err => {
    throw err
  });

  if (cb.result.length > 0) {
    ctx.body = {
      exists: true,
      salt: cb.result[0].salt,
      //newSalt: generateSalt(16), // 改由前端生成，节约服务器计算成本
    }
  } else {
    ctx.body = {
      exists: false,
      salt: null, // ，节约服务器计算成本
      //newSalt: generateSalt(16), // 改由前端生成，节约服务器计算成本
    }
  }

  return next();
}

module.exports = {
  GET_usernameExistence
};