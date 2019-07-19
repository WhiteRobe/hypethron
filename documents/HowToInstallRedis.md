# 如何正确安装、配置Redis

> 如果您对如何安装和配置Redis有所经验，您可以跳过本篇指南并[返回首页](https://github.com/WhiteRobe/hypethron)。

## 安装Redis

### Windows环境下安装Redis

Redis默认的运行环境是Linux，但是微软开源项目维护了一版Redis：[https://github.com/microsoftarchive/redis](https://github.com/microsoftarchive/redis)。

需要注意的是，微软已经停止对该项目进行维护，其Redis版本依旧停留在3.0版本(而最新的社区版本也只到4.0版本)。

下载地址: [https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)

安装参考: [https://www.runoob.com/redis/redis-install.html](https://www.runoob.com/redis/redis-install.html)

### Linux环境下安装Redis

本项目在阿里云上搭建了Redis环境并进行了测试，其版本为5.0.5。我们建议您与我们采用同样的系统(Unbuntu 16.0.4)。

Linux环境下，Redis的安装相当容易：

1. 访问Redis官网，下载Stable版本的软件：[![](https://img.shields.io/badge/Redis_5.0.5-download-red.svg?logo=redis&style=flat-square)](https://redis.io/download)

2. 切换到安装目录，使用指令`make`编译安装软件。

在使用指令 `./src/redis-server ./redis.conf` 启动服务器之前，如果您需要通过远程访问Redis数据库，您还需要查看下一节的内容。

## 配置Redis

> 如果你需要通过远程访问你的Redis数据库，你需要配置你的服务器(例如，阿里云)上Redis的相关文件，使得其能够通过远程进行访问；否则，你可以跳过这些内容，直接通过 `127.0.0.1` 访问Redis数据库。

由于Redis并没有提供访问控制，所以除非是网站应用与Redis在同一台主机上，你应当配置Redis安装目录下的【**redis.conf**】文件，以较为安全地开放Redis数据库远程访问权限：

1. 配置密钥

将`#requirepass foobared`替换为`requirepass ${pw}`，其中【${pw}】为访问密码。由于Redis数据库的访问速度较快，你应当设定一个较长的密码，防止暴力破解。

2. 解除IP绑定

把该文件中的`bind 127.0.0.1`修改为`bind 0.0.0.0`。

3. 按照配置文件启动Redis

Linux下执行指令 `./src/redis-server ./redis.conf`。不同的系统环境下可能略有差异，以文档中所指示的方法为准。

> 注: Windows下的启动指令可能为：`redis-server.exe redis.windows.conf`

- 我们推荐您修改`port 6379`为另外一个非默认端口，防止他人进行针对默认端口进行扫描攻击。
- 如果仍旧无法访问，请检查本机防火墙对设定的端口是否开放通信。
- 特别的是，阿里云还需要在控制台手动开放相应端口。

---

[返回首页](https://github.com/WhiteRobe/hypethron)