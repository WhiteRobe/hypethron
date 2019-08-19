const mysql = require("mysql");
const chalk = require('chalk');
const MYSQL_CONFIG = require("./mysql-configure.js");


/**
 * 连接MySQL
 * @param opt 连接选项 @See https://www.npmjs.com/package/mysql#connection-options
 * @param connectDetail 连接详情选项
 * @return {Connection}
 */
function connectMySQL(connectDetail, opt) {
  // 连接提示
  let DEFAULT = Object.assign({}, MYSQL_CONFIG);
  opt = Object.assign(DEFAULT, opt);
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
 * 获得一个MySQL连接池
 * @param opt 连接选项 @See https://www.npmjs.com/package/mysql#connection-options
 * @return {Promise<Pool>}
 */
async function getMySQLPool(opt) {
  let DEFAULT = Object.assign({}, MYSQL_CONFIG);
  opt = Object.assign(DEFAULT, opt);
  return mysql.createPool(opt);
}


/**
 * 数据库接入测试
 */
async function mysqlConnectTest() {
  let mysql = connectMySQL(true /*connect with default params, but put detail*/);
  return new Promise((resolve, reject) => {
    mysql.query('SELECT 1 + 1 AS solution',)
      .on('error', err => {
        let errorMsg = "Fail to connect to MySQL[Error]: " + err;
        console.log(chalk.red(errorMsg));
        reject(err);
      })
      .on('result', row => {
        console.log(chalk.green("[Hypethron]MySQL Connect Test:", 'Success!', '\n'));
        resolve({
          message: "[Hypethron]Connect To MySQL!"
        })
      })
      .on('end', () => {
        mysql.end();
      });
  });
}

module.exports = {
  connectMySQL,
  getMySQLPool,
  mysqlConnectTest
};