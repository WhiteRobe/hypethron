/**
 * 输入一个userEmail，返回一个该userEmail是否存在的标志。
 * @input { userEmail: $String }
 * @output { exists: $Boolean }
 */
async function GET_userEmailExistence(ctx, next) {
  let mysql = ctx.global.mysqlPoolDM;
  let userEmail = ctx.request.query.userEmail;

  ctx.assert(userEmail, 400, 'need @params:userEmail');

  let cb = await mysql.query(
    {sql: 'SELECT email FROM user_profile WHERE email=? ;', timeout: 10000}, [userEmail]
  ).catch(err => {
    throw err
  });

  ctx.body = {
    exists: cb.result.length > 0
  };

  return next();
}

module.exports = {
  GET_userEmailExistence
};