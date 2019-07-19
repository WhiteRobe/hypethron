var Redis = require("ioredis");
const chalk = require('chalk');
const REDIS_CONFIG = require("./redis-configure.js");


// 连接提示
console.log(chalk.bold("-----[" + new Date() + "]-----"));
console.log(chalk.bold("Trying to connect to Redis with config:"));
console.log(REDIS_CONFIG);
console.log(chalk.bold("---------------------------------------------------------"));

var redis = new Redis(REDIS_CONFIG);

module.exports = redis;