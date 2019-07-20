const Redis = require("ioredis");
const chalk = require('chalk');
const REDIS_CONFIG = require("./redis-configure.js");


/**
 * 连接redis
 * @param opt 连接选项 @See https://github.com/luin/ioredis/blob/HEAD/API.md#new-redisport-host-options
 * @param connectDetail 连接详情选项
 * @return {Redis|*}
 */
async function connect(connectDetail, opt){
  // 连接提示
  opt = opt || REDIS_CONFIG;
  if(connectDetail){
    console.log(chalk.bold("-----[" + new Date() + "]-----"));
    console.log(chalk.bold("Trying to connect to Redis with config:"));
    console.log(opt);
    console.log();
  }
  return new Redis(opt);
}

module.exports = connect;