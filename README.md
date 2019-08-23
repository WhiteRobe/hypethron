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

"hypethron/院庭"是一款基于React和Node.js的信息可视化、统计和管理系统。

整体将采用 **React+Node.js(koa)** 前后端分离的开发模式，数据库采用**Redis**+**MySQL**，系统功能将包含以下内容：

- 管理员后台系统
- 基本信息采集系统
- 基本信息可视化统计(Echarts实现)
- 基本信息管理
- 高级过滤搜索
- 数据库导出、备份
- 多级权限控制
- 群发邮件通知
- 服务器日志
- 黑名单ip过滤/DDOS防范

一些Feature:

- 支持Https和Http及多端口访问
- SQL注入防范
- XSS攻击防范
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

你可以到此处查看该项目的效果：[项目演示|Examples](#-example)。


## 快速上手 Quick-Start

### Ⅰ 基础环境 Runtime

“hypethron/院庭”依赖于Node.js环境，所以您应当先在本机配置Node.js环境。

您可以通过指令`node -v`查看你的系统是否已经安装Node.js环境及其版本号。我们推荐的Node版本为`10.8.x`以上。

否则，您应该按照[这篇文章的指引](/documents/HowToInstallNode.md)安装或重新安装相应版本的Node.js环境。

### Ⅱ 安装应用 Installation

目前提供了以下几种方式来获取Web应用：

#### ① 从Github安装(Install with Git)

- **Step 1** 获取源码 Download Source-Code

> `git clone git@github.com:WhiteRobe/hypethron.git`

- **Step 2** 配置环境 Initialization

> **(Windows)** 执行 `/InitEnvironment(windows).bat` 脚本，从淘宝镜像源拉取项目依赖。
>
> **(Linux)** 执行 `/InitEnvironment(linux).sh` 脚本，从淘宝镜像源拉取项目依赖。

#### ② 直接使用发行版(Install with release-version)

(暂未取得发行版)

### Ⅲ 服务器配置 Configuration

服务器需要连接MySQL、Redis数据库及SMTP服务器，在已经安装相应软件的基础下，这可能需要花费3~5分钟。

您可以参考[配置文档](/documents/HowToDoConfiguretion.md)进行这些常量值的配置。

### Ⅳ 启动项目 Usage

1. (第一次启动时)执行`npm run build`打包、发布SPA应用到`/build`目录下。
2. 在完备的Node.js开发环境下，进入项目根目录，通过 `npm run server-start` 指令启动服务器。

程序将自动创建超级管理员账号，你可以使用超管的权限，利用[相关API](/documents/sysdoc/APIdoc.md#useraccountsuid)修改绑定的邮箱：

字段|预设值
:-:|:-:
username/账户名|SuperAdmin
password/密码|admin123

## 项目演示 Example

完整界面演示请参考：[暂未编写]

## 项目文档 Documents

我们将提供开发过程中的各类文档，请查看我们的[Wiki](https://github.com/WhiteRobe/hypethron/wiki)。另外，到此[查看项目依赖](https://github.com/WhiteRobe/hypethron/network/dependencies)。

## 社区指南 Contributing

您可以在遵循本项目相关开源协议的情况下，使用、修改本项目。

在参与项目时请遵循[行为指南](.github/CODE_OF_CONDUCT.md)。

我们欢迎任何人指出缺点、修正我们的项目：

1. 请【Fork】这个项目，修改、添加您觉得有必要变动的内容，向我们提交【Pull Request】。
2. 在【Issues】中提出您的意见。

>For more detail? @See [CONTRIBUTING.md](.github/CONTRIBUTING.md)。

## 作者 Collaborators
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