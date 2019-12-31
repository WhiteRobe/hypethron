const options = { // @See https://www.npmjs.com/package/nodemailer
  host: "smtpdm.aliyun.com", // your SMTP host
  port: 80,
  secure: false, // true for 465(SSL), false for other ports
  auth: {
    user: 'user@example.com', // your account
    pass: 'password' // like: "password"
  }
};

module.exports = options;