const crypto = require('crypto');

/**
 * 产生一个定长随机字符串
 * @param length 随机盐的长度
 * @return {string}
 */
function generateSalt(length){
  length = parseInt(length) || 1;

  if (!Number.isFinite(length)) { // isFinite 判断是否为有限数值
    throw new TypeError('Expected a finite number');
  }

  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}


/**
 * HMAC 计算
 * @param secretKey 密钥/盐
 * @param content 原文
 * @param opt 参数 { alg:算法，可用列表见下, repeat:重复次数(正整数) }
 * @return {string} 哈希散列
 */
function hmac(secretKey, content, opt) {
  opt = opt || {};
  let repeat = parseInt(opt.repeat)|| 1; // 重复次数，非数字或非正数数会被默认设置为1

  if (!Number.isFinite(repeat)) { // isFinite 判断是否为有限数值
    throw new TypeError('Expected a finite number');
  }

  let hashMsg = content;
  for(let i=0; i<(repeat>0?repeat:1); i++){
    let hmac = crypto.createHmac(opt.alg || 'md5', ''+secretKey);
    hmac.update(hashMsg);
    hashMsg = hmac.digest('hex');
  }
  return hashMsg;
}

module.exports = { generateSalt, hmac };


/*
console.log(crypto.getHashes());

[ 'DSA',
  'DSA-SHA',
  'DSA-SHA1',
  'DSA-SHA1-old',
  'RSA-MD4',
  'RSA-MD5',
  'RSA-MDC2',
  'RSA-RIPEMD160',
  'RSA-SHA',
  'RSA-SHA1',
  'RSA-SHA1-2',
  'RSA-SHA224',
  'RSA-SHA256',
  'RSA-SHA384',
  'RSA-SHA512',
  'dsaEncryption',
  'dsaWithSHA',
  'dsaWithSHA1',
  'dss1',
  'ecdsa-with-SHA1',
  'md4',
  'md4WithRSAEncryption',
  'md5',
  'md5WithRSAEncryption',
  'mdc2',
  'mdc2WithRSA',
  'ripemd',
  'ripemd160',
  'ripemd160WithRSA',
  'rmd160',
  'sha',
  'sha1',
  'sha1WithRSAEncryption',
  'sha224',
  'sha224WithRSAEncryption',
  'sha256',
  'sha256WithRSAEncryption',
  'sha384',
  'sha384WithRSAEncryption',
  'sha512',
  'sha512WithRSAEncryption',
  'shaWithRSAEncryption',
  'ssl2-md5',
  'ssl3-md5',
  'ssl3-sha1',
  'whirlpool' ]
 */