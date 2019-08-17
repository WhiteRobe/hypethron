const {global} = require('./global.js');
// const logger = global.logger; // Note:it will not work because global.logger hasn't been set when static segment runs

const chalk = require('chalk');
const {ReplyError} = require('ioredis');


/**
 * 服务器错误处理
 * Http-Status @See https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status
 * @param err
 * @param ctx
 */
function errorHandler(err, ctx) {
  ctx.status = typeof err.status ===  "number" ? err.status : 500;
  ctx.body = err.detail ? `${err.message}\n${err.detail}` : err.message;

  let logger = global.logger;

  if(err instanceof ReplyError){ // Redis Error
    // logger.debug(err);

  } else if (!err.sqlMessage){ // MySql Error
    // logger.debug(err);
    // console.log(err.code, err.errno, err.fatal, err.sql, err.sqlState, err.sqlMessage);
  }
}

/**
 * 处理完错误后的方法
 * @param err
 * @param ctx
 */
function afterErrorHandler(err, ctx){
  /* Do when error is handled */
  let logger = global.logger;

  if (ctx.SERVER_DEBUG) {
    console.error(chalk.red('[Debug]Server Error'), err/*, ctx*/);
    logger.debug(err + (err.detail ? `\n${err.detail}` : ''));
  } else if (parseInt(err.status) >= 500){
    /* When server is not under debug mode, only log server-errors.*/
    logger.error(err + (err.detail ? `\n${err.detail}` : ''));
  } else {
    /* do nothing to general-error */
  }
}

module.exports = {
  errorHandler,
  afterErrorHandler
};