const log4js = require('koa-log4');
const path = require('path');
// 日志级别优先级 ALL <TRACE <DEBUG <INFO <WARN <ERROR <FATAL <MARK <OFF 


// 你可以添加新的日志配置，但不要移除现有的配置！
const LOGGER_CONFIGURE = {
  appenders: { // 附加器配置
    access: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log',
      filename: path.join('./logs/', 'access.log') // 访问日志
    },
    application: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log',
      filename: path.join('./logs/', 'application.log'), // 应用层级的日志
      layout: {
        type: 'pattern',
        // pattern: '[%d{yyyy-MM-dd-hh:mm:ss}] %h - [%p] : %m %n in file[%l:%o] | %f %n %s' // 似乎enableCallStack 不起效，就很迷
        pattern: '[%d{yyyy-MM-dd-hh:mm:ss}]%X{loggerName}:%h - [%p] : %m %n ',
      }
    },
    out: {
      type: 'console'
    }
  },
  categories: { //仓库配置
    default: {appenders: ['out'], level: 'all'},
    access: {appenders: ['access'], level: 'all'},
    application: {appenders: ['application'], level: 'all', enableCallStack: true} // 最小级别
  }
};

log4js.configure(LOGGER_CONFIGURE); // 应用配置

module.exports.log4js = log4js; // 导出配置好的日志类
module.exports.accessLogger = () => log4js.koaLogger(log4js.getLogger('access')); // 记录所有访问级别的日志