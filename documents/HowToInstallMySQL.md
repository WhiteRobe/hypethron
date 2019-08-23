# 如何正确安装MySQL数据库

> 如果您对如何安装和配置MySQL有所经验，您可以跳过本篇指南并[返回首页](/README.md)。

## 安装MySQL

### Windows环境下安装MySQL

1. 到此处下载社区版数据库：[![](https://img.shields.io/badge/MySQL-8.0.16-informational.svg?logo=mysql&style=flat)](https://dev.mysql.com/downloads/mysql/)

2. 按照相应指引完成安装。

### Linux环境下安装MySQL

本项目在阿里云上搭建了Redis环境并进行了测试，其版本为5.0.5。我们建议您与我们采用同样的系统(Ubuntu 16.0.4)。

Linux(Ubuntu)环境下的安装请参考[这篇文章](https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/#repo-qg-apt-repo-manual-setup)，其主要流程为：

1. 下载安装配置指引文件：[![](https://img.shields.io/badge/MySQL-8.0.16-informational.svg?logo=mysql&style=flat)](https://dev.mysql.com/get/mysql-apt-config_0.8.13-1_all.deb)
2. 执行指令：`sudo dpkg -i mysql-apt-config_0.8.13-1_all.deb` 运行该文件，并根据配置完成软件配置。
3. 执行指令：`sudo apt-get update`，按照安装配置指引文件获取软件源。
4. 执行指令：`sudo apt-get install mysql-server`，下载完毕后设置数据库`root`用户的密码。

> 您可以执行`service mysql status`来检查数据库是否安装、运行成功。

## 开放远程登录权限

如果您需要授权远程登陆，您需要通过以**任一**一种方法进行授权：

**① 修改用户表**

```
mysql> USE mysql;  

mysql> UPDATE user SET host = '%' WHERE user = 'root';  

```
退出MySQL，然后重启数据库：`sudo service mysql restart`

> 该方法将授权`root`用户在任意域名(`%`)访问该数据库。

**② 直接授权**

```
mysql> GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'password' WITH GRANT OPTION;  

mysql> FLUSH   PRIVILEGES; 
```

> 该方法将授权`root`用户在任意域名(`%`)以`password`的密码访问该数据库。

---

[返回首页](/README.md)