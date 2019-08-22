# 服务器各项启动前参数配置

**配置清单**

你需要配置以下三个内容：

1. Mysql数据库
2. Redis数据库
3. SMTP-Mail服务器
4. (可选)配置HTTPS或绑定其它端口

下面是详细的配置教程，在已经安装相应软件的基础下，可能需要花费3~5分钟。

## 配置步骤

- **Step 1** Redis数据库安装与配置 Configure the Redis

如果您还没有安装Redis数据库，您需要在正确的环境下安装Redis数据库，详见[如何正确安装Redis数据库](/documents/HowToInstallRedis.md)。

在 `/server/dao` 目录中，编辑【redis-configure.js】文件，其中各字段意义如下:

字段|意义|例值
:-:|:-:|:-:
port | 服务器访问端口 | 6379
host | 服务器IP/域名 | "127.0.0.1"
family | IP版本 | 4
password | 数据库访问密码 | "password"
db | 所使用的数据库ID | 0
connectionName | 连接名 | "default"
poolOption | 连接池配置 | 参考[此处](https://www.npmjs.com/package/generic-pool)

你可以添加其它的配置，请参考：[ioredis配置](https://github.com/luin/ioredis/blob/HEAD/API.md#new_Redis)。

> 如果您在 `/server/dao` 目录下没有自动找到【redis-configure.js】文件，可以到`/documents/examples`目录中获取。

- **Step 2** MySQL数据库的安装与配置 Configure the MySQL

如果您还没有安装MySQL数据库，您需要在正确的环境下安装MySQL数据库，详见[如何正确安装MySQL数据库](/documents/HowToInstallMySQL.md)。

在 `/server/dao` 目录中，编辑【mysql-configure.js】文件，其中各字段意义如下:

字段|意义|例值
:-:|:-:|:-:
host | 服务器IP/域名 | "127.0.0.1"
port | 服务器访问端口 | 3306
user | 数据库访问账号 | "root"
password | 数据库访问密码 | "password"
database | 所使用的数据库 | "my_database"
connectionLimit | 连接池大小 | 10

你可以添加其它的配置，请参考：[mysql配置](https://www.npmjs.com/package/mysql#connection-options)。

> 如果您在 `/server/dao` 目录下没有自动找到【mysql-configure.js】文件，可以到`/documents/examples`目录中获取。

- **Step 3** 配置Mail服务器 Configure the smtp-mail-server

在 `/server` 目录中，编辑【mailer-configure.js】文件，其中各字段意义如下:

字段|意义|例值
:-:|:-:|:-:
host | 邮件服务器 | "smtpdm.aliyun.com"
port | 服务器访问端口 | 80
secure | 是否启用SSL(端口465时起效) | false
auth.user | 邮箱账号 | "example@hypethron.com"
auth.pass | 邮箱密码 | "password"

> 如果您在 `/server/` 目录下没有自动找到【mailer-configure.js】文件，可以到`/documents/examples`目录中获取。

- **Step 4** 配置Koa服务器 Configure the server

由于hypethron是一个支持多端口、多接入的Web应用，你可以通过配置相关文件来新增一个服务器。

如果您只准备通过默认设置启动(HTTP协议+3000端口)服务器，您<u>可以跳过</u>这一节；否则，请参考：[如何注册一个服务器](/documents/HowToRegisterAServer.md)。

---

[返回首页](/README.md)