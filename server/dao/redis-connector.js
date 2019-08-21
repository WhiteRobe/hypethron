const Redis = require("ioredis");
const chalk = require('chalk');
const genericPool = require('generic-pool');
const REDIS_CONFIG = require("./redis-configure.js");
const {RedisPoolManager} = require("./db-manager.js");

/**
 * 连接redis
 * @param opt 连接选项 @See https://github.com/luin/ioredis/blob/HEAD/API.md#new-redisport-host-options
 * @param connectDetail 连接详情选项
 * @return {Redis|*}
 */
function connectRedis(connectDetail, opt) {
  // 连接提示
  let DEFAULT = Object.assign({}, REDIS_CONFIG);
  opt = Object.assign(DEFAULT, opt);
  if (connectDetail) {
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
async function getRedisPool(opt) {
  let DEFAULT = Object.assign({}, REDIS_CONFIG);
  opt = Object.assign(DEFAULT, opt);
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
  let redis = connectRedis(!process.env.HIDE_CONNECT_DETAIL /*connect with default params, but put detail*/);
  await redis.set("hypethron.redis-connect-test", "Success!");
  try {
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
  return {
    message: "[Hypethron]Connect To Redis!"
  }
}


/**
 * create a redis-session for `koa-session`
 * @return {RedisSession}
 */
async function createRedisSession() {
  let opt = Object.assign({}, REDIS_CONFIG);
  const pool = await getRedisPool(Object.assign(opt, {db: 1, connectionName: "session"}));

  class RedisSession {
    constructor(pool) {
      this.pool = new RedisPoolManager(pool);

      this.get = this.get.bind(this);
      this.set = this.set.bind(this);
      this.destroy = this.destroy.bind(this);

      this.rolling = this.rolling.bind(this);
    }

    async get(key, maxAge, opt) {
      opt = opt || {rolling: false}; // 是否需要rolling
      let result = await this.pool.get(key).catch(err => console.error(err));
      result = JSON.parse(`${result}`);
      if (opt.rolling) {
        this.rolling(key, result, maxAge);
      }
      return result;
    }

    async set(key, sess, maxAge, opt) {
      opt = opt || {rolling: false, changed: false};
      if (opt.changed || opt.rolling) {
        return await this.pool.set(key, JSON.stringify(sess), 'PX', maxAge).catch(err => console.error(err));
      }
    }

    async destroy(key) {
      return await this.pool.del(key).catch(err => console.error(err));
    }

    rolling(key, sess, maxAge) {
      // sess should be a json-object
      if ((maxAge / 2) > Date.now() - sess._expire) { // 小于剩余时间的一半，更新值的残存时间
        sess._expire = Date.now(); // 对开始时的时间戳重新记录
        this.pool.set(key, JSON.stringify(sess), 'PX', maxAge).then().catch(err => console.error(err));
      }
    }
  }

  return new RedisSession(pool);
}

module.exports = {
  connectRedis,
  getRedisPool,
  redisConnectTest,
  createRedisSession
};