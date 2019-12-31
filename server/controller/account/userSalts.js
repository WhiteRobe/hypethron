/**
 * 输入一个 username，返回一个该username的盐。username还可以是email或phone。
 * @input { username: $String }
 * @output { salt: $String }
 * @throw { 403: 用户不存在 }
 */
async function GET_userSalts(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let username = ctx.request.query.username;

  ctx.assert(username, 400, '@input:username is required.');

  let cb = await mysql.query(
    {
      sql: 'SELECT a.salt FROM user_account AS a LEFT JOIN user_profile AS b ON a.uid=b.uid ' +
        'WHERE a.username=? or b.email=? or b.phone=? ;',
      timeout: 10000
    }, [username, username, username]
  ).catch(err => {
    throw err;
  });


  if (cb.result.length > 0) { // 仅在成功时返回
    ctx.body = {
      salt: cb.result[0].salt
    }
  } else {
    ctx.throw(403, 'User not exists!')
  }

  return next();
}


async function OPTIONS_userSalts(ctx, next) {
  ctx.response.set('Allow', 'GET');
  return next();
}

module.exports = {
  GET_userSalts,
  OPTIONS_userSalts
};