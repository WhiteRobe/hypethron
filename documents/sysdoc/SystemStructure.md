# 系统架构

## 技术栈构成

项目采用前后端分离式的开发，项目启动时由 `create-react-app` 构建，在此之上封装了Koa及其它中间件作为服务端。其技术栈概览如下:

- 前端: `react`
- 前端路由: `react-router`
- 前端状态机: `redux`
- UI组件库: `ant-react` + `Echarts`
- 前端测试: `kest` + `react-test-render`
- AJAX: `axios`

- 数据库: `Redis`*(5.0.5)*
- 数据库接入: `ioredis`
- 后端框架: `koa`
- 主要中间件:  `koa-jwt`(身份验证)、`koa-compress`(数据压缩)、`koa-log4`(服务器日志)、`koa-router`(服务器路由)、`koa-static`(静态文件服务器)

- 持续集成测试及统计: `Travis CI` 、 `Coveralls`
- Git仓库: `github`

## 服务端架构

服务器采用koa作为框架，目前已使用的中间件有：

- "koa": "^2.7.0"
- "koa-body": "^4.1.0"
- "koa-compress": "^3.0.0"
- "koa-convert": "^1.2.0"
- "koa-helmet": "^4.2.0"
- "koa-ip-filter": "^3.0.0"
- "koa-log4": "^2.3.2"
- "koa-router": "^7.4.0"
- "koa-static": "^5.0.0"
- "koa-jwt": "^3.6.0"

服务器基于`Node.js`环境，其文件的存放均位于`/server`目录下。


### 数据库

数据库采用**Redis***(5.0.5)*，其配置情况可参考[如何正确安装Redis数据库](/documents/HowToInstallRedis.md)和[数据库配置](https://github.com/WhiteRobe/hypethron#%E2%85%B2-%E6%9C%8D%E5%8A%A1%E5%99%A8%E9%85%8D%E7%BD%AE-configuration)。

数据库接入依赖采用`ioredis`，你可以到[此处获取其文档](https://www.npmjs.com/package/ioredis)。

<s>在时间允许的条件下，我们准备对数据库访问进行二次封装以使得多数据库的接入和二次开发成为可能。这意味着您并不需要再配置和学习Redis即可使用该项目。</s>

### 接口开发

接口开发采用RESTful的方式，同时所有的默认接口均暴露在`/api/`地址下。由于采用了前后端分离的SPA开发方案，前端仅通过AJAX与后端交互，没有任何SSR的内容，配合接口文档可以进行二次开发。

- 详细接口文档可参考：[接口文档|API doc](/documents/sysdoc/APIdoc.md)。

- 要对服务器的接口进行二次开发，请参考：[如何新增一个接口|How to Add An API](/documents/HowToAddAnAPI.md)。

### 静态服务器

由于采用了前后端分离的开发方式，后端并不主动控制应用的路由。相反的是，前端将通过react-router进行路由导航。

后端将监听所有路由，并通过监听、暴露`/pages`的方式，始终提供向用户前端SPA的HTML入口。

这就意味着，除了`/index.html`文件之外，所有前端页面(的导航)都需要暴露到`/pages`路径下；所有静态文件需要存放到`/`下和`/static`中，因此根目录和`/static`将作为保留地址，不允许二次开发时进行使用。

其后端实现代码如下:
```
const staticPageRouter = KoaRouter();
staticPageRouter.all("/*", (ctx, next) =>{
  ctx.response.type = "text/html";
  ctx.response.body = fs.readFileSync(
    path.join(__dirname, require('./server-configure.js').STATIC_DIRECTORY, 'index.html')
  );
  return next();
});
router.use("/pages", staticPageRouter.routes(), staticPageRouter.allowedMethods());
```

前端路由：
```
<Router>
  <Route exact path="/" component={HypethronIntroPage}/>
  <Route path="/pages/home" component={HomePage}/>
</Router>
```


## 前端管理

前端管理主要分为两个部分进行管理：**页面**与**状态**。

因此我们采用React+Redux的架构，采用视图与状态相分离的方式。即视图组件与数据容器组件相分离的模式，方便将视图层与状态层进行解耦。

我们将状态划分为三种：**全局状态**、**局部状态**和**UI状态**。
其中，"全局状态"和"局部状态"均由Redux管理，"UI状态"交由React视图组件进行管理。

我们采用`react-redux`在根目录的路由组件进行全局注入，这样，SPA的子组件均可以通过`react-redux.connect()`方法建立与Redux的联系。

关于如何进行状态管理和与Redux进行交互，请参考 [如何连接Redux|How To Connect To Redux](/documents/HowToConnectToRedux.md)和[演示DEMO](/src/components/ReduxDemo/ReduxDemo.js)。