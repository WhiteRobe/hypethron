/**
 * 存放服务器的全局常量
 * 仅在服务器启动时设置，后期不应发生修改
 */
const global = {
  logger: null,// 日志对象
  mysqlPoolDM: null, // MySQL连接池管理对象
  redisPool: null // Redis连接池
};


/**
 * 操作响应状态
 */
const RES_MSG = {
  "OK": "OK", // (通用)操作成功
  "FAIL": "(通用)操作失败！",
  "FAIL_DUPLICATE": "字段重复",
  "REJECTION": "请求被拒绝！请确保有足够的权限。",
  "UPLOAD_FAIL": "文件上传失败！",
  "DATABASE_ERROR": "数据库错误。",
  "JWT_NOT_FOUND": "缺失TOKEN。",
  "JWT_TOKEN_INVALID": "JWT验证不通过。"
};



module.exports = {
  global,
  RES_MSG
};