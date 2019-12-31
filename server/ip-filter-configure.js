/**
 * 修改options对象中的filter参数值以建立新的白名单
 */


// @See https://github.com/tunnckoCore/ip-filter
const options = {
  filter: [], // 配置IP过滤(黑名单正则)，如 `*`，若匹配中返回原串否则返回Null
  whitelist: [], // ip白名单
  forbiddenMsg: '403: Forbidden\n黑名单用户，请联系网站管理员!'
};

module.exports = options;
