/* 用户信息表 */
CREATE TABLE IF NOT EXISTS h_account(
    /* 用户标识符 */ UID INTEGER UNSIGNED AUTO_INCREMENT /* 自0起的无符号正整数 */,
    /* 用户名 */ Username VARCHAR(16) UNIQUE NOT NULL /* 长度在6~16(含)的字符，合法字符为英文、数字和下划线 */,
    /* 用户账户 */ Account VARCHAR(50) UNIQUE NOT NULL /* 另作定义，原则上为通过正则合法性校验的邮箱、手机号码(含国际区号) */,
    /* 开放账户 */ OpenID VARCHAR(100) NOT NULL /* 长度在1~16(含)个中英文字符，合法字符为Unicode所收录的字符 */,
    /* 用户密码(Hash) */ Password CHAR(32) NOT NULL /* 另作定义，原则上为一个具有具体含义的Token串 */,
    /* 用户的盐 */ Salt CHAR(11) NOT NULL /* 明文密码为长度在6~16(含)的英文、数字等非制表符混合串，原则上至少需要包含大小写英文、数字和下划线等符号中的两种。在数据库中以32位的Hash串进行存储。*/,
    /* 用户权限 */ Authority INTEGER UNSIGNED  DEFAULT 2 /* 最多可达到2^32 */,
    PRIMARY KEY (UID)
);