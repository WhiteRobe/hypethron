/**
 * 存放服务器的全局常量
 * 仅在服务器启动时设置，后期不应发生修改
 */
const global = {
  logger: null,// 日志对象
  mysqlPoolDM: null, // MySQL连接池管理对象
  redisPoolDM: null // Redis连接池管理对象
};


// /**
//  * 操作响应状态
//  */
// const RES_MSG = {
//   "OK": "OK", // (通用)操作成功
//   "FAIL": "(通用)操作失败！",
//   "FAIL_DUPLICATE": "字段重复",
//   "REJECTION": "请求被拒绝！请确保有足够的权限。",
//   "UPLOAD_FAIL": "文件上传失败！",
//   "DATABASE_ERROR": "数据库错误。",
//   "JWT_NOT_FOUND": "缺失TOKEN。",
//   "JWT_TOKEN_INVALID": "JWT验证不通过。",
//   "AUTH_LOW": "用户权限过低。",
//   "MISS_PARAMS": "缺失必要参数。",
//   "CAPTCHA_MISS_MATCH": "验证码不匹配。",
//   "SEND_MAIL_FAIL": "发送邮件失败。"
// };


/**
 * 权限表
 */
const AUTH = {
  "BAN": 1, // 封禁用户
  "ORDINARY":2, // 普通用户
  "VIP":4, // 付费用户
  "ADMIN":8, // 管理员
  "SUPER_ADMIN":16, // 超级管理员
  "ADMIN_GROUP": 24, // 管理组(8+16)
  // ------ //
  "TRAFIC_DATA_READ":2048, // 流量数据分析
  "USER_DATA_ANALYSIS":4096 // 用户数据分析
};


module.exports = {
  global,
  // RES_MSG,
  AUTH
};