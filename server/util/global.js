/**
 * 存放服务器的全局常量
 * 仅在服务器启动时设置，后期不应发生修改
 */



const global = {
  logger: null,// 日志对象
  mysqlPool: null, // MySQL连接池
  redisPool: null // Redis连接池
};

module.exports.global = global;