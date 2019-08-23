const FILE_ERROR_CODE = 777;
const {hmac, generateSalt} = require('../util/crypto-hash-tool.js');
const {SERVER_SALT} = require('../server-configure.js');
const {AUTH, global} = require('../util/global.js');
const chalk = require('chalk');

/**
 * 用于初始化系统中的mysql数据库表结构及键入初始数据
 */
const fs = require("fs");

/**
 * 尝试建立表结构和初始化超管账号
 * @param sqlFileUrl slq文件路径
 */
async function buildDBEnvironment(sqlFileUrl) {
  try {

    await createTables(sqlFileUrl).catch(err =>{
      throw err;
    });

    // 创建管理员账号
    await createAdmin().catch(error => {
      throw error;
    });


  } catch (err) {
    console.error(err);
    process.exit(FILE_ERROR_CODE);
  }
}


/**
 * 尝试建立表结构，如果失败则会直接退出程序，终止服务器启动
 * @param sqlFileUrl
 * @return {Promise<void>}
 */
async function createTables(sqlFileUrl){
  let mysql = global.mysqlPoolDM;

  let data = fs.readFileSync(sqlFileUrl); // 读取SQL语句
  let sentences = data.toString().replace(/\s+/gim, ' ').split(';');
  for (let i of sentences) {
    // console.log(i+"\n");
    /* jshint loopfunc: true */
    if (i.length <= 0) continue; // skip EMPTY_QUERY
    await mysql.query(i + ';').catch(err => {
      throw err;
    });
  }
}


/**
 * 尝试建立超管账号，如建立失败给出提示而不直接结束进程
 * @return {Promise<void>}
 */
async function createAdmin() {
  let mysql = global.mysqlPoolDM;
  let logger = global.logger;

  let username = 'SuperAdmin';
  let res = await mysql.query('SELECT * FROM user_account WHERE username=?;', [username]).catch(err => {
    throw err;
  });
  console.log(chalk.bold("---------------------------------------------------------\n"));
  if (res.result.length <= 0) { // 数据库里不存在超管的账号

    let connection = await mysql.beginTransaction().catch(err => {// 获取一个事务实例
      throw err;
    });

    try {

      let salt = generateSalt(16);
      let originPw = "admin123";
      let password = hmac(SERVER_SALT, hmac(salt, originPw, {
        alg: 'sha256',
        repeat: 100
      }), {alg: 'md5', repeat: 1});

      let sql = [
        `INSERT INTO user_account(username, password, salt, authority) VALUES(?, ?, ?, ?);`,
        `INSERT INTO user_profile(uid, nickname, email) VALUES(?, ?, ?);`,
        `INSERT INTO user_privacy(uid) VALUES(?);`
      ];

      // 插入用户表
      await connection.query(sql[0], [username, password, salt, AUTH.SUPER_ADMIN]).catch(err => {
        throw err;
      });

      res = await connection.query('SELECT uid FROM user_account WHERE username=?;', [username]).catch(err => {
        throw err;
      });

      if (res.result.length > 0) { // 构建联表
        let uid = res.result[0].uid;
        // 插入资料表
        await connection.query(sql[1], [uid, 'SuperAdmin', `EditThisByAPI@hypethron.com`], ).catch(err => {
          throw err;
        });
        // 插入隐私表
        await connection.query(sql[2], [uid]).catch(err => {
          throw err;
        });

        await connection.commit().catch(err => {
          throw err;
        });

        console.log(chalk.black.bgGreenBright(`SuperAdmin-Account doesn't exits! Auto created.`));
        console.log(chalk.black.bgGreenBright(`username:"${username}"\npassword: "${originPw}"\n`));
        logger.info(`SuperAdmin-Account doesn't exits! Auto created => username:"${username}"|password: "${originPw}"`);
      } else {
        throw new Error('Not created!');
      }
    } catch (err) {
      await connection.rollback().catch();
      console.log(chalk.black.bgRed(`SuperAdmin-Account doesn't exits and fail to auto-created. See logs for more detail.\n`));
      console.log(chalk.black.bgRed(`While you can create it manually by operating your mysql-database.\n`));
      logger.warn(err);
    } finally {
      connection.release();
    }
  } else {
    console.log(chalk.black.bgBlue(`SuperAdmin-Account already exits!\n`));
  }
}


module.exports = {
  buildDBEnvironment
};