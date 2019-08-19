const nodemailer = require("nodemailer");
const opt = require('../mailer-configure.js');

// const fs = require('fs');

/**
 *
 * @param mail 邮件信息
 * @example:
 *   send({
 *    from: 'Hypethron 😀 <register@noreply.hypethron.com>', // sender address
 *    to: "example@host.com", // list of receivers
 *    subject: "Hello ", // Subject line
 *    html: "Hello World!" // fs.readFileSync("./server/mail/general.template.html") // html body
 *  }).catch(err => {
 *    throw  err;
 *  });
 *
 * @return {Promise<string>}
 */
async function send(mail) {
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport(opt);

    // send mail with defined transport object
    let info = await transporter.sendMail(mail);

    return `${info.messageId}`;
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  } catch (err) {
    console.log(err);
    throw err;
  }
}


module.exports = send;