const {connectMySQL} = require('../dao/mysql-connector.js');

/**
 * 运行此脚本以直接清除所注册的数据库表单
 */


let tables = [
  'user_privacy',
  'user_profile',
  'user_account'
];

cleanDatabase().then();

async function cleanDatabase() {
  // if(!process.env.DEBUG){
  //   return console.log(`Only run in debug-mode`);
  // }
  let mysql = connectMySQL();
  try{
    for(let table of tables){
      await dropTablePromise(mysql, table).catch(err =>{
        throw err;
      });
      console.log(`Drop table ${table} success!`);
    }
  } catch (e) {
    console.error(`Clean Database Fail!`);
  } finally {
    mysql.end();
  }
}

function dropTablePromise(conn, table){
  return new Promise((resolve, reject) => {
    conn.query(`DROP TABLE ${table};`, (err, res) =>{
      if(err) reject(err);
      else resolve(res);
    });
  })
}