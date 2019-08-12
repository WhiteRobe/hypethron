/**
 * 存放服务器的全局常量
 * 仅在服务器启动时设置，后期不应发生修改
 */
const global = {
  logger: null,// 日志对象
  mysqlPool: null, // MySQL连接池
  redisPool: null // Redis连接池
};


/**
 * 操作响应状态
 */
const RES_MSG = {
  "OK": "(通用)操作成功！",
  "FAIL": "(通用)操作失败！",
  "REJECTION": "请求被拒绝！请确保有足够的权限",
  "UPLOAD_FAIL": "文件上传失败！",
  "DATABASE_ERROR": "数据库错误"
};


/**
 * 测试一段代码的运行时间
 * @param func 要执行的代码
 */
function timeUsage(func) {
  console.time();
  func();
  console.timeEnd();
}

module.exports = {
  global,
  RES_MSG,
  timeUsage
};