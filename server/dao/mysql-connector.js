const mysql = require("mysql");
const chalk = require('chalk');
const MYSQL_CONFIG = require("./mysql-configure.js");


/**
 * 连接MySQL
 * @param opt 连接选项 @See https://github.com/luin/ioredis/blob/HEAD/API.md#new-redisport-host-options
 * @param connectDetail 连接详情选项
 * @return {Connection}
 */
function connectMySQL(connectDetail, opt) {
  // 连接提示
  opt = opt || MYSQL_CONFIG;
  if (connectDetail) {
    console.log(chalk.bold("-----[" + new Date() + "]-----"));
    console.log(chalk.bold("Trying to connect to MySQL with config:"));
    console.log(opt);
    console.log();
  }
  let connection = mysql.createConnection(opt);
  connection.connect();
  return connection;
}


/**
 * 获得一个MySQL连接线程池
 * @param opt 连接选项 @See https://github.com/luin/ioredis/blob/HEAD/API.md#new-redisport-host-options
 * @return {Promise<Pool>}
 */
async function getMySQLPool(opt){
  opt = opt || MYSQL_CONFIG;
  return mysql.createPool(opt);
}


/**
 * 数据库接入测试
 */
async function mysqlConnectTest() {
  let mysql = connectMySQL(true /*connect with default params, but put detail*/);
  mysql.query('SELECT 1 + 1 AS solution',)
    .on('error', err => {
      let errorMsg = "Fail to connect to MySQL[Error]: " + err;
      console.log(chalk.red(errorMsg));
    })
    .on('result', row => {
      console.log(chalk.green("[Hypethron]MySQL Connect Test:", 'Success!', '\n'));
    })
    .on('end', () => {
      mysql.end();
    });
  return {
    message: "[Hypethron]Connect To MySQL!"
  }
}

module.exports = {
  connectMySQL,
  getMySQLPool,
  mysqlConnectTest
};