/**
 * Configure Your SERVER
 */

// STATIC_DIRECTORY 的目录是相对于start-server.js文件的
// sslOptions 的目录是相对于根目录的

const SERVER_CONFIG = {
  def: {
    port: 3000, // Server port
    enableSLL: false, // Wanna to start a ssl http-server?
    sslOptions: { // Only required when $enableSLL is true
      key: null, // Your private-key URL
      cert: null  // Your ssl-certificate URL
    }
  },
  // You can run an extra HTTPS-server by adding this:
  /*
  ssl: {
    port: 3001,
    enableSLL: true,
    sslOptions: {
      key: './server/ssl/privateKey.pem',
      cert: './server/ssl/certificate.pem'
    }
  }*/
};


const SKIP_HYPETHRON_INTRO_PAGE = false;
const STATIC_DIRECTORY = '../build'; // Where the production-spa is

module.exports.SERVER_CONFIG = SERVER_CONFIG;
module.exports.SKIP_HYPETHRON_INTRO_PAGE = SKIP_HYPETHRON_INTRO_PAGE;
module.exports.STATIC_DIRECTORY = STATIC_DIRECTORY;

/*
你可以通过以下命令生成一份自签名的SSL证书:
    #1、生成私钥key文件：
    openssl genrsa -out privateKey.pem 1024

    #2、通过私钥生成CSR证书签名  （需要填一些信息、可直接回车）
    openssl req -new -key privateKey.pem -out certrequest.csr

    #3、通过私钥和证书签名生成证书文件
    openssl x509 -req -in privateKey.csr -signkey privateKey.pem -out certificate.pem
*/