# 注册一个新服务器

服务器框架采用 ![](https://img.shields.io/badge/koa-2.7-black.svg) ，支持多端口和HTTP及HTTPS，要注册、修改一个服务器的配置，您需要在 `/server/` 目录中，编辑【server-configure.js】文件中的 `SERVER_CONFIG`，其中各字段意义如下:

字段|类型|意义|例值
:-:|:-:|:-:|:-:
port | int |服务器访问端口 | 3000
enableSLL | boolean |是否启用HTTPS(需要同时配置sslOptions) | false
sslOptions | object |SSL相关证书的配置 | (详见下文)


示例：

```
// key-name will be treat as server-name, and register into server-map
def: {
        port: 3000, // Server port
        enableSLL: false, // Wanna to start a ssl http-server?
        sslOptions: { // Only required when $enableSLL is true
            key: null, // Your private-key URL
            cert: null  // Your ssl-certificate URL
        }
    },
    ......
```

## 生成SSL自签名证书

你可以通过以下命令生成一份自签名的SSL证书:

1.生成私钥key文件：

`openssl genrsa -out privateKey.pem 1024`

2.通过私钥生成CSR证书签名  （需要填一些信息、可直接回车）

`openssl req -new -key privateKey.pem -out certrequest.csr`

3.通过私钥和证书签名生成证书文件

`openssl x509 -req -in privateKey.csr -signkey privateKey.pem -out certificate.pem`


## 全局常量配置

字段|类型|意义|例值
:-:|:-:|:-:|:-:
SKIP_HYPETHRON_INTRO_PAGE | boolean | 跳过院庭介绍页 | false
STATIC_DIRECTORY | string | 静态资源地址 | "../build"
SERVER_PRIVATE_KEY | string | 服务器JWT私钥 | "WhiteRobe/hypethron@Github"
MD5_SALT | string | 服务器MD5盐 | "WhiteRobe/hypethron@Github"
JWT_PROTECT_UNLESS | array[Reg] | 不受JWT保护的目录 | [/^\/static/]
JWT_OPTIONS | object | jsonwebtoken的配置 | [参考](https://www.npmjs.com/package/jsonwebtoken)
KOA_JWT_CONFIGURE | object | koa-jwt的配置 | [参考](https://www.npmjs.com/package/koa-jwt)
COOKIE_KEY_LIST | array[string] | cookie签名的key列表 | [参考](https://www.npmjs.com/package/keygrip)
SESSION_AES_KEY | object | session的AES加密密钥 | 应该为16位长的字符串
KOA_SESSION_CONFIGURE | | object | koa-session的配置 | [参考](https://github.com/koajs/session)
RATE_LIMIT_CONFIGURE | object | 访问频率限制 | [参考](https://github.com/koajs/ratelimit#options)

## 环境变量

字段|类型|意义|例值
:-:|:-:|:-:|:-:
DEBUG | boolean | debug模式 | false
HIDE_CONNECT_DETAIL | any | 隐藏启动服务器时的参数配置输出 | null

---

[返回首页](https://github.com/WhiteRobe/hypethron)