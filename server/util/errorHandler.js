const { global} = require('./global.js');
// const logger = global.logger; // Note:it will not work because global.logger hasn't been set when static segment runs

/**
 * 服务器错误处理
 * @param err
 */
function errorHandler(err){
  let logger = global.logger;
  logger.error(err);
}


module.exports = errorHandler;