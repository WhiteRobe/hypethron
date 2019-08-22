# NPM指令

- "compile-start": 编译SPA并启动服务器(同下条)
- "server-start": 启动服务器，此时所有接口皆可被前端调用
- "dev-server-start": 在Debug模式下启动服务器(设置环境变量DEBUG=`true`)
- "dev-start": 在Debug模式下启动webpack静态文件服务器，能够热渲染页面元素，但无法调用后端接口
- "build": 打包应用，即编译SPA并将其发布到`/build`目录下
- "silent": 启动静默模式(设置环境变量DEBUG=`false`和HIDE_CONNECT_DETAIL=`null`)
- "test": 运行测试控制台，对SPA进行单元测试
- "test-coverage": 在CI环境中进行覆盖测试并生成报告，用于持续集成测试平台
- "test-coverage-ci": 在CI环境中进行覆盖测试并生成报告(CI=`true`)，用于本地进行单次覆盖测试
- ~~"eject": 弹出React-Script的webpack等配置~~

---

[返回首页](/README.md)