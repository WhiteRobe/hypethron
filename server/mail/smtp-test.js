const nodemailer = require("nodemailer");
const SMTP_MAIL_CONFIGURE = require('../mailer-configure.js');
const chalk = require('chalk');

/**
 * SMTP connect test.
 * @params opt
 * @return {Promise<any>}
 */
module.exports = (opt) => {
  if(!process.env.HIDE_CONNECT_DETAIL){
    console.log(chalk.bold("-----[" + new Date() + "]-----"));
    console.log(chalk.bold("Trying to connect to SMTP with config:"));
    console.log(SMTP_MAIL_CONFIGURE);
    console.log();
  }
  opt = opt || SMTP_MAIL_CONFIGURE;
  return new Promise((resolve, reject) => {
    nodemailer.createTransport(opt)
      .verify((error) => {
        if (error) {
          console.log(chalk.red(`Fail to connect to MySQL[Error]: ${error.message}`));
          reject(error);
        } else {
          let msg = "[Hypethron]SMTP Connect Test: Success!";
          console.log(chalk.green(msg, '\n'));
          resolve(msg);
        }
      });
  });
};