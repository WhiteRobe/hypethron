/**
 * 获取状态码的说明
 * @output { result:$JSON-String }
 */
async function GET_restfulStatus(ctx, next) {
  let result = {
    "general": "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status",
    "400": "一般是参数缺失，如未生成验证码、请求参数缺失或格式不正确等.",
    "401": "缺失授权信息.",
    "403": "权限不足、越级操作等.",
    "404": "资源不存在或其它不准备向客户端剧透透露的情况.",
    "405": "请求中指定的请求方法不能被用于请求相应的资源.",
    "406": "请求所要求的条件无法满足，如希望一次性生成大量数据等.",
    "408": "服务器超时，可能的原因有数据库超时等.",
    "409": "其它冲突问题，如资源过期、验证码生成失败、JWT所使用的场景(如ip)不正确等.",
    "410": "资源已被移除或不存在."
  };
  ctx.body = {
    result
  };
  return next();
}

module.exports = {
  GET_restfulStatus
};