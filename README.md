<h1 align="center"> hypethron/院庭 </h1>
<p align="center">
	<img src="/documents/logo/logo.png" width="200px"/>
</p>
<p align="center">
	<a href="https://github.com/WhiteRobe/hypethron/blob/master/LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000"/></a>
	<img src="https://img.shields.io/github/repo-size/WhiteRobe/hypethron.svg"/>
	<img src="https://img.shields.io/github/last-commit/WhiteRobe/hypethron.svg"/>
	<a href="http://hits.dwyl.io/WhiteRobe/hypethron"><img src="http://hits.dwyl.io/WhiteRobe/hypethron.svg"/></a>
	<!--<a href="https://coveralls.io/github/WhiteRobe/hypethron?branch=master" target="_blank">
	    <img src="https://coveralls.io/repos/github/WhiteRobe/hypethron/badge.svg?branch=master"/>
	</a>-->
	<a href="https://coveralls.io/github/WhiteRobe/hypethron" target="_blank">
	    <img src="https://img.shields.io/coveralls/github/WhiteRobe/hypethron/master.svg"/>
	</a>
	<a href="https://www.travis-ci.org/WhiteRobe/hypethron" target="_blank">
		<img src="https://img.shields.io/travis/WhiteRobe/hypethron/master.svg"/>
	</a>
	<!--<img src="https://api.travis-ci.org/WhiteRobe/hypethron.svg?branch=master"/>
	<!--<img src="https://img.shields.io/github/forks/WhiteRobe/hypethron.svg?style=social"/>-->
</p>
<p align="center">
	<img src="https://img.shields.io/badge/Node.js-10-green.svg?logo=node.js&style=flat-square"/>
	<img src="https://img.shields.io/badge/React-16-blue.svg?logo=react&style=flat-square"/>
	<img src="https://img.shields.io/badge/MySQL-8.0.16-informational.svg?logo=mysql&style=flat-square"/>
	<img src="https://img.shields.io/badge/Redis-5.0-red.svg?logo=redis&style=flat-square"/>
	<img src="https://img.shields.io/badge/Babel-v7-yellow.svg?logo=babel&style=flat-square"/>
	<img src="https://img.shields.io/badge/koa-2.7-black.svg"/>
	<img src="https://img.shields.io/badge/javascript-ES6-blue.svg"/>
</p>

## 介绍 Introduction

"hypethron/院庭"是一款基于React和Node.js的人员信息可视化、统计和管理系统。

整体将采用 **React+Node.js(koa)** 前后端分离的开发模式，数据库采用**Redis**+**MySQL**，系统功能将包含以下内容：

- 管理员后台系统
- 人员信息采集系统
- 人员信息可视化统计(Echarts实现)
- 人员信息管理
- 高级过滤搜索
- 数据库导出、备份
- 多级权限控制
- 群发邮件通知
- 服务器日志
- 黑名单ip过滤

一些Feature:

- 支持Https和Http
- 多端口访问
- RESTful
- 数据压缩传送
- JWT访问控制
- 二次开发所需的文档
- 持续集成测试
- SPA(PWA for Https)
- Cookie签名认证
- Session加密(AES)
- 前端可跨平台开发
- ...

你可以到此处查看该项目的效果：[项目演示|Examples](https://github.com/WhiteRobe/hypethron#%E9%A1%B9%E7%9B%AE%E6%BC%94%E7%A4%BA-example)。


## 快速上手 Quick-Start

### Ⅰ 基础环境 Runtime

“hypethron/院庭”依赖于Node.js环境，所以您应当先在本机配置Node.js环境。

您可以通过指令`node -v`查看你的系统是否已经安装Node.js环境及其版本号是否在10.8.x以上。否则，您应该按照以下步骤安装或重新安装相应版本的Node.js环境：

1. 下载Node.js(v10.8+)： [![](https://img.shields.io/badge/Node.js-download-green.svg?logo=node.js&style=flat)](https://nodejs.org/en/)

2. 配置环境变量( `{NodejsDirectory}` 为Node.js安装所在目录)：

>**(Windows)** 右键【我的电脑】 -> 【属性】 -> 【高级系统设置】 -> 【环境变量】-> 在path字段添加 `{NodejsDirectory}/bin` 。
>
>**(Linux)** `vim ~/.bashrc` -> 添加 `export PATH="$PATH:{NodejsDirectory}/bin"` -> `source ~/.bashrc` 。



### Ⅱ 安装应用 Installation

目前提供了以下几种方式来获取Web应用：

#### ① 从Github安装(Install with Git)

- **Step 1** 获取源码 Download Source-Code

> `git clone git@github.com:WhiteRobe/hypethron.git`

- **Step 2** 配置环境 Initialization

> **(Windows)** 执行 `/InitEnvironment(windows).bat` 脚本，从淘宝镜像源拉取项目依赖，并完成相应配置文件的创建。
>
> **(Linux)** 执行 `/InitEnvironment(linux).sh` 脚本，从淘宝镜像源拉取项目依赖，并完成相应配置文件的创建。

- **Step 3** 打包应用 Pack *(非必需 not-necessary)*

> 执行命令行 `npm run build` 打包、发布生产环境的应用。
>
> 应用将被编译、打包到项目目录下的 `/build` 中。随后，你可以将该目录部署到后端的控制域内。详见下文-[启动项目|Usage](https://github.com/WhiteRobe/hypethron#%E2%85%B3-%E5%90%AF%E5%8A%A8%E9%A1%B9%E7%9B%AE-usage)。


#### ② 直接使用发行版(Install with release-version)

(暂未取得发行版)


### Ⅲ 服务器配置 Configuration

- **Step 1.1** Redis数据库安装与配置 Configure the Redis

你需要在正确的环境下安装Redis数据库，详见[如何正确安装Redis数据库](documents/HowToInstallRedis.md)。*(如果您已经安装过Redis服务器，您可以跳过这一节)*

- **Step 1.2** 配置Redis连接信息 Configure the Redis-Connector

在 `/server/dao` 目录中，编辑【redis-configure.js】文件，其中各字段意义如下:

字段|意义|例值
:-:|:-:|:-:
port | 服务器访问端口 | 6379
host | 服务器IP/域名 | "127.0.0.1"
family | IP版本 | 4
password | 数据库访问密码 | "password"
db | 所使用的数据库ID | 0
connectionName | 连接名 | "default"

你可以添加其它的配置，请参考：[ioredis配置](https://github.com/luin/ioredis/blob/HEAD/API.md#new_Redis)。

> 如果您在 `/server/dao` 目录下没有自动找到【redis-configure.js】文件，可以到`/documents/examples`目录中获取。

- **Step 2.1** Mysql服务器的安装 Configure the MySQL

> Windows环境下Mysql基于可视化的安装极其简单，Linux环境的安装请参考[这篇文章](https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/#repo-qg-apt-repo-manual-setup)。

- **Step 2.2** 配置Mysql连接信息 Configure the MySQL-Connector

在 `/server/dao` 目录中，编辑【mysql-configure.js】文件，其中各字段意义如下:

字段|意义|例值
:-:|:-:|:-:
host | 服务器IP/域名 | '127.0.0.1'
port | 服务器访问端口 | 3306
user | 数据库访问账号 | 'root'
password | 数据库访问密码 | 'password'
database | 所使用的数据库 | 'my_database'

> 如果您在 `/server/dao` 目录下没有自动找到【mysql-configure.js】文件，可以到`/documents/examples`目录中获取。
你可以添加其它的配置，请参考：[mysql配置](https://www.npmjs.com/package/mysql#connection-options)。

- **Step 3** 配置Koa服务器 Configure the server

由于hypethron是一个支持多端口、多接入的Web应用，你可以通过配置相关文件来新增一个服务器。

如果您只准备通过默认设置启动(HTTP协议+3000端口)服务器，您可以跳过这一节；否则，请参考：[如何注册一个服务器](documents/HowToRegisterAServer.md)。


### Ⅳ 启动项目 Usage

> 如果你利用Git获取了该项目的代码，你需要进行以下**任一**启动步骤；
>
> 否则，请直接执行 `npm run server-start` 以启动Web应用和Http服务器。

#### ① 按默认配置编译并启动

1. 在完备的Node.js开发环境下：`npm run compile-start` 。
2. 默认配置下，在浏览器打开 `http://localhost:3000` 以查看项目。

#### ② 自定义配置编译并启动

1. 按照[服务器配置|Configuration](https://github.com/WhiteRobe/hypethron#%E2%85%B2-%E6%9C%8D%E5%8A%A1%E5%99%A8%E9%85%8D%E7%BD%AE-configuration)，对服务器进行配置。
2. 某些情况下，需要按照 [安装应用(打包应用)|Installation(Pack)](https://github.com/WhiteRobe/hypethron#-%E4%BB%8Egithub%E5%AE%89%E8%A3%85intall-with-git) 中的指引进行编译、打包。
3. 以生产环境的模式启动：`npm run server-start` 。
4. 按照你的配置在浏览器打开Web应用以查看项目。


## 项目演示 Example

完整界面演示请参考：[暂未编写]

## 项目文档

我们将提供开发过程中的各类文档，请查看我们的[Wiki](https://github.com/WhiteRobe/hypethron/wiki)。

## 社区指南 Contributing

您可以在遵循本项目相关开源协议的情况下，使用、修改本项目。

在参与项目时请遵循[行为指南](.github/CODE_OF_CONDUCT.md)。

我们欢迎任何人指出缺点、修正我们的项目：

1. 请【Fork】这个项目，修改、添加您觉得有必要变动的内容，向我们提交【Pull Request】。
2. 在【Issues】中提出您的意见。

>For more detail? @See [CONTRIBUTING.md](.github/CONTRIBUTING.md)。

## 作者 Authors
<table>
	<tr>
		<td>
			WhiteRobe(<a href="https://github.com/WhiteRobe" target="_blank">@WhiteRobe</a>)
		</td>
		<td>
			<a href="https://blog.csdn.net/Shenpibaipao/" target="_blank">
				<img src="https://img.shields.io/badge/身披白袍-Shenpibaipao-green.svg?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAIAAACQKrqGAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE6WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOS0wNi0yM1QxNTo1NTowMSswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTktMDYtMjNUMTU6NTU6NTErMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTktMDYtMjNUMTU6NTU6NTErMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjQ5OTI3M2ZiLWMyMDYtOGQ0OC1iYjllLWRiMTI1MTJiYTc2NiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0OTkyNzNmYi1jMjA2LThkNDgtYmI5ZS1kYjEyNTEyYmE3NjYiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0OTkyNzNmYi1jMjA2LThkNDgtYmI5ZS1kYjEyNTEyYmE3NjYiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ5OTI3M2ZiLWMyMDYtOGQ0OC1iYjllLWRiMTI1MTJiYTc2NiIgc3RFdnQ6d2hlbj0iMjAxOS0wNi0yM1QxNTo1NTowMSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz45baZ7AAABvElEQVQoz32SzUoCURTHD4iLQOgBctEruAxUcOmqvYK46wl6hZZuWuRGECMXBkWKouUHkZnpZFYoaEb4OXNHtGZyZCZ1pjMfCW06/C/3cM+Pw/8cLnCDAU/ITBT/Ec+yiAFH03h9tNuGWq1Jvc4Wi8zVFZPJkHx+XKtxoxFiMJdlNputWiyUxVIGKAJUAJ62t5s7O027/cVme9jcJIkEYjBXFDadLgHkAKomU39/ny8UZElSfoO/vKSj0dlioaG53DVAw+FYTqd6ebVYCI2G8Pws9XokFBoeHwurlYr2j44erVYDEsVXj6eysXEHUNZ0C6AaUBQQZLl3eDgJh3X0ze/PAiB3r6ms5SSdVtGv+RwzsdPRUcpsxsko9K2potEklVJR9Ds8OZlVq0ZXnw+73miruNFUXnfF0w0EOru765EHBwdNt7vpdLbc7pbLhTaYiwsDZeLxAgD2+6Zp5W/g1nCsYSRioGw+j95xX/Wtrfe9PRIMfiSTn5nMNBbreL0lk4nRN8AR8tntTmq1CUUxqdQgEhlGo/TZGX1+PorFRqenWOL6fcRA/S4sKyyXa+GgM0lSP4ok6S/8eIzYD7RMqg7UJHT/AAAAAElFTkSuQmCC"/>
			</a>
		</td>
	</tr>
	<tr>
		<td>
			JiaWeiWangWang(<a href="https://github.com/jiaweiwangwang" target="_blank">@jiaweiwangwang</a>)
		</td>
		<td>
			<a href="" target="_blank">
				<img src="https://img.shields.io/badge/github-jiaweiwangwang-green.svg?logo=github&style=for-the-badge"/>
			</a>
		</td>
	</tr>
</table>