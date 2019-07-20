const mysql = require("mysql");
const chalk = require('chalk');
const MYSQL_CONFIG = require("./mysql-configure.js");


/**
 * 连接MySQL
 * @param opt 连接选项 @See https://github.com/luin/ioredis/blob/HEAD/API.md#new-redisport-host-options
 * @param connectDetail 连接详情选项
 * @return {Redis|*}
 */
async function connectMySQL(connectDetail, opt){
  // 连接提示
  opt = opt || MYSQL_CONFIG;
  if(connectDetail){
    console.log(chalk.bold("-----[" + new Date() + "]-----"));
    console.log(chalk.bold("Trying to connect to MySQL with config:"));
    console.log(opt);
    console.log();
  }
  return mysql.createConnection(opt).connect();
}


/**
 * 数据库接入测试
 */
async function mysqlConnectTest() {
  let mysql = await connectMySQL(true /*connect with default params, but put detail*/);
  mysql.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) {
      let errorMsg = "Fail to connect to MySQL[Error]: " + error;
      console.log(chalk.red(errorMsg));
      throw error;
    } else {
      console.log(chalk.green("[Hypethron]MySQL Connect Test:", 'Success', '\n'));
    }
  });
  await mysql.end();
  return{
    message: "[Hypethron]Connect To MySQL!"
  }
}

module.exports = {
  connectMySQL,
  mysqlConnectTest
};