/* 用户信息表 */
CREATE TABLE IF NOT EXISTS user_account(
    /* 用户标识符 */ uid INTEGER UNSIGNED AUTO_INCREMENT /* 自1起的无符号正整数 */,
    /* 用户名 */ username VARCHAR(16) UNIQUE NOT NULL /* 长度在6~16(含)的字符，合法字符为英文、数字和下划线 */,
    /* 开放账户 */ openid VARCHAR(100) DEFAULT '' /* 另作定义，原则上为一个具有具体含义的Token串 */,
    /* 用户密码(Hash) */ password CHAR(32) NOT NULL /* 明文密码为长度在6~16(含)的英文、数字等非制表符混合串，原则上至少需要包含大小写英文、数字和下划线等符号中的两种。在数据库中以32位的Hash串进行存储 */,
    /* 用户的盐 */ salt CHAR(16) NOT NULL /* 用户的盐，定长字符串 */,
    /* 用户权限 */ authority INTEGER UNSIGNED  DEFAULT 2 /* 最多可达到2^32 */,
    PRIMARY KEY (uid)
);

/* 用户资料表 */
CREATE TABLE IF NOT EXISTS user_profile(
    /* 用户标识符 */ uid INTEGER UNSIGNED UNIQUE NOT NULL /* 自0起的无符号正整数 */,
    /* 昵称 */ nickname VARCHAR(16) NOT NULL /* 长度在1~16(含)个中英文字符，合法字符为Unicode所收录的字符 */,
    /* 用户头像 */ avatar_pic CHAR(38) DEFAULT 'default_avatar_pic.jpg' /* 一个定长路径指向用户的头像地址: hash(32).suffix */,
    /* 用户性别 */ sex ENUM('m', 'f', '?') DEFAULT '?' /* 用户性别代值: male|female|unknown */,
    /* 用户生日 */ birthday DATETIME DEFAULT '1949-10-01' /* 用户生日格式: yyyy-mm-dd */,
    /* 用户组织 */ company VARCHAR(50) DEFAULT '' /* (个人通用资料)用户所处的公司/组织/学校等 */,
    /* 用户所在地 */ location VARCHAR(50) DEFAULT '' /* (个人通用资料)用户所在地格式: 一级-二级-三级 */,
    /* 用户主页 */ website VARCHAR(300) DEFAULT '' /* (个人通用资料)一个超链接，指向用户自定义的页面 */,
    /* 用户个性签名或经历 */ biography VARCHAR(300) DEFAULT '' /* 用户个性签名或个人经历等 */,
    /* 用户手机 */ phone CHAR(15) UNIQUE /* (绑定内容，需验证，非空情况下可用作账号登录)用户手机，国际区号+11位号码。如, 86_12345678901 */,
    /* 用户邮箱 */ email VARCHAR(50) UNIQUE NOT NULL/* (绑定内容，需验证，可用作账号登录)用户邮箱 */,
    INDEX (phone),
    INDEX (email),
    PRIMARY KEY (uid),
    FOREIGN KEY (uid) REFERENCES user_account (uid)
);

/* 用户资料隐私表 */
CREATE TABLE IF NOT EXISTS user_privacy(
    /* 用户标识符 */ uid INTEGER UNSIGNED UNIQUE NOT NULL /* 自0起的无符号正整数 */,
    /* 个人通用资料可见 */ privacy_general TINYINT(1) DEFAULT 1 /* 个人资料默认可见 */,
    /* 性别可见 */ privacy_sex TINYINT(1) DEFAULT 1 /* 性别默认可见 */,
    /* 生日可见 */ privacy_birthday TINYINT(1) DEFAULT 1 /* 生日默认可见 */,
    /* 手机可见 */ privacy_phone TINYINT(1) DEFAULT 0 /* 手机号码默认不可见 */,
    /* 邮箱可见 */ privacy_email TINYINT(1) DEFAULT 0 /* 邮箱地址默认不可见 */,
    PRIMARY KEY (uid),
    FOREIGN KEY (uid) REFERENCES user_account (uid)
);