const KoaIpFilter = require('koa-ip-filter');

/**
 * 修改options对象中的filter参数值以建立新的白名单
 */


/**
 * Params
 options {Object}
 id {Function}: custom identifier, defaults to this.ip
 strict {Boolean}: to throw when not valid IPv4/IPv6? default true
 filter {Array|String|RegExp|Function}: black/white list filter
 forbidden {String|Function}: custom message when 403 Forbidden response
 returns {GeneratorFunction}
 */
const options = {
  // id : this.ip,
  strict: false,
  filter: ['*'], // 配置IP过滤
  forbidden: '403: 黑名单用户，请联系网站管理员!',

};

const koaIpFilter = new KoaIpFilter(options);

module.exports = () => koaIpFilter;
