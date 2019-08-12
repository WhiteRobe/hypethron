const crypto = require('crypto');


const algorithm_default = 'aes-128-cbc'; // 加密算法
let key_16 = "Hype0Lk5G3PthRoN"; // 密钥 (16位长)
let iv_16 = "WhiTeEDz2jW1caY9"; // Initial Vector(16位长)


/**
 * 加密
 * @param src:string 原文
 * @param algorithm 算法
 * @param key 密钥
 * @param iv Initial Vector
 * @return {string}
 */
function aesEncrypt(src, algorithm ,key, iv) {
  //console.log("原来输入", src);
  key = Buffer.from(key || key_16, 'utf8');
  iv = Buffer.from(iv || iv_16, 'utf8');
  let sign = '';
  const cipher = crypto.createCipheriv(algorithm || algorithm_default, key, iv);
  sign += cipher.update(src, 'utf8', 'hex');
  sign += cipher.final('hex');
  //console.log("原来输出", sign);
  return sign;
}


/**
 * 解密
 * @param sign:string 密文
 * @param algorithm 算法
 * @param key 密钥
 * @param iv Initial Vector
 * @return {string}
 */
function aesDecrypt(sign, algorithm, key, iv) {
  //console.log("解码输入", sign);
  key = Buffer.from(key || key_16, 'utf8');
  iv = Buffer.from(iv || iv_16, 'utf8');
  let src = '';
  const cipher = crypto.createDecipheriv(algorithm || algorithm_default, key, iv);
  src += cipher.update(sign, 'hex', 'utf8');
  src += cipher.final('utf8');
  //console.log("解码输出", src);
  return src;
}

module.exports = { aesDecrypt, aesEncrypt };