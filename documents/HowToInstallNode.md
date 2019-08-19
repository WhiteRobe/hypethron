# 如何配置Node.js环境

> 如果您对如何安装和配置Node.js有所经验，您可以跳过本篇指南并[返回首页](https://github.com/WhiteRobe/hypethron)。

1. 下载Node.js(v10.8+)： [![](https://img.shields.io/badge/Node.js-download-green.svg?logo=node.js&style=flat)](https://nodejs.org/en/)

2. 配置环境变量( `{NodejsDirectory}` 为Node.js安装所在目录)：

>**(Windows)** 右键【我的电脑】 -> 【属性】 -> 【高级系统设置】 -> 【环境变量】-> 在path字段添加 `{NodejsDirectory}/bin` 。
>
>**(Linux)** `vim ~/.bashrc` -> 添加 `export PATH="$PATH:{NodejsDirectory}/bin"` -> `source ~/.bashrc` 。

---

[返回首页](https://github.com/WhiteRobe/hypethron)