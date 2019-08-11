const Redis = require("ioredis");
const chalk = require('chalk');
const genericPool = require('generic-pool');
const REDIS_CONFIG = require("./redis-configure.js");


/**
 * 连接redis
 * @param opt 连接选项 @See https://github.com/luin/ioredis/blob/HEAD/API.md#new-redisport-host-options
 * @param connectDetail 连接详情选项
 * @return {Redis|*}
 */
function connectRedis(connectDetail, opt){
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

/**
 * 获得一个Redis连接池
 * @param opt 连接选项
 * @See https://github.com/luin/ioredis/blob/HEAD/API.md#new-redisport-host-options
 * @See https://www.npmjs.com/package/generic-pool
 * @return {Promise<Pool>}
 */
async function getRedisPool(opt){
  opt = opt || REDIS_CONFIG;
  let factory = {
    create: () => new Redis(opt),
    destroy: (client) => client.disconnect()
  };
  return genericPool.createPool(factory, opt.poolOption);
}


/**
 * 数据库接入测试
 */
async function redisConnectTest() {
  let redis = connectRedis(true /*connect with default params, but put detail*/);
  redis.set("hypethron.redis-connect-test", "Success!");
  try{
    await redis.get("hypethron.redis-connect-test", (err, result) => {
      if (err !== null) {
        let errorMsg = "Fail to connect to Redis[Error]: " + err;
        console.log(chalk.red(errorMsg));
      } else {
        console.log(chalk.green("[Hypethron]Redis Connect Test:", result, '\n'));
      }
    });
  } catch (e) {
    throw e;
  }
  await redis.del("hypethron.redis-connect-test");
  await redis.disconnect();
  return{
    message: "[Hypethron]Connect To Redis!"
  }
}

module.exports = {
  connectRedis,
  getRedisPool,
  redisConnectTest
};