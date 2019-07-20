# 系统架构

## 技术栈构成

项目采用前后端分离式的开发，项目启动时由 `create-react-app` 构建，在此之上封装了Koa及其它中间件作为服务端。其技术栈概览如下:

- 前端: `react`
- 前端路由: `react-router`
- 前端状态机: `redux`
- UI组件库: `ant-react` + `Echarts`
- 前端测试: `kest` + `react-test-render`
- AJAX: `axios`

- 数据库: `Redis`*(5.0.5)* + `MySQL`*(8.0.16)*
- 数据库接入: `ioredis`、`mysql`
- 后端框架: `koa`
- 主要中间件:  `koa-jwt`(身份验证)、`koa-compress`(数据压缩)、`koa-log4`(服务器日志)、`koa-router`(服务器路由)、`koa-static`(静态文件服务器)

- 持续集成测试及统计: `Travis CI` 、 `Coveralls`
- Git仓库: `github`

## 服务端架构和管理概览

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
- "koa-session": "^5.12.2"

服务器基于`Node.js`环境，其文件的存放均位于`/server`目录下，可以脱离Web前端发行软件包独立运行。这就意味着前端可以进行跨平台的二次开发。


### 数据库

数据库采用**Redis***(5.0.5)*+**MySQL***(8.0.16)*的双数据库配置。前者用于处理热数据及提供非侵入式的数据可视化接口，后者用于基本Web应用业务及冷数据的固化。

其中，Redis的配置情况可参考[如何正确安装Redis数据库](/documents/HowToInstallRedis.md)和[数据库配置](https://github.com/WhiteRobe/hypethron#%E2%85%B2-%E6%9C%8D%E5%8A%A1%E5%99%A8%E9%85%8D%E7%BD%AE-configuration)。

Redis数据库的接入依赖采用`ioredis`，你可以到[此处获取其文档](https://www.npmjs.com/package/ioredis)。

MySQL数据库的接入依赖采用`mysql`，你可以到[此处获取其文档](https://www.npmjs.com/package/mysql)。

### 接口开发

接口开发采用RESTful的方式，同时所有的私有接口均暴露在`/api/`地址下。由于采用了前后端分离的SPA开发方案，前端仅通过AJAX与后端交互，没有任何SSR的内容，配合接口文档可以进行二次和跨平台开发。

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
### 访问控制

服务器采用JWT进行访问验证和 [keygrip](https://www.npmjs.com/package/keygrip) 作为签名认证。

在默认配置下，受到JWT保护的服务器资源需要通过在HTTP请求头中通过添加以下内容进行访问:
`Authorization`: `Bearer <token>`，其中 `<token>` 的值由`jsonwebtoken`进行签发。
该部分内容请参考 [`koa-jwt`的文档](https://www.npmjs.com/package/koa-jwt) 和 [/server/server-configure.js](/server/server-configure.js)。

在默认配置下，服务器路径中所有被映射到`/`、`/static/*`、`/pages/*`、`/papi`的资源都是不受JWT保护的，该部分配置可到[`/server/server-configure.js`](/server/server-configure.js)中进行自定义。


### 会话管理

服务端采用[`koa-session`](https://www.npmjs.com/package/koa-session)作为会话管理包，但不采用其默认的Base64而是AES128CDC*(参考:`/server/util/crypto-aes-tool.js`)*作为加密方法。

根据该npm包的架构设计，所有会话内容将被存放到`ctx.session`中，你可以通过`ctx.session.$key`来获取相应的值，如：
```
ctx.session.name = 'hypethron'; // 后台会自动加密
console.log(ctx.session.name); // 后台会自动解码
```

被设置到`ctx.session`中的值会被加密和签名中放到Cookie中。
默认设置下，你可以通过`ctx.cookies.get('hypethron:sess')`取到原值；通过`ctx.cookies.get('hypethron:sess.sig')`获得签名(SHA256)，然后用其进行验证(后台已经实现了这部分功能，您不必操心)。

> 我们推荐您在二次开发时使用JWT来控制访问权限，而不是将此类信息通过session、cookie进行保管和传输。

> 由于koa-session使用数据库作为会话存放仓库会降低服务器效率，因此我们不建议引入数据库作为存储区。但这也限制了session所能存放信息的大小，我们建议您不要存放大量信息在session中，并及时释放不需要的资源：`ctx.session.$key = null`。
> - 但是，如果您有需要，我们在[`/server/server-configure.js`](/server/server-configure.js)预留了接口，请参考[相应文档](https://www.npmjs.com/package/koa-session#external-session-stores)进行配置。

## 前端架构和管理概览

> Note:当前的前端特指Web前端。必要时，可以接入React-Naive进行嵌入式开发。

前端管理主要分为两个部分进行管理：**页面**与**状态**。

因此我们采用React+Redux的架构，采用视图与状态相分离的方式。即视图组件与数据容器组件相分离的模式，方便将视图层与状态层进行解耦。

我们将状态划分为三种：**全局状态**、**局部状态**和**UI状态**。
其中，"全局状态"和"局部状态"均由Redux管理，"UI状态"交由React视图组件进行管理。

我们采用`react-redux`在根目录的路由组件进行全局注入，这样，SPA的子组件均可以通过`react-redux.connect()`方法建立与Redux的联系。

关于如何进行状态管理和与Redux进行交互，请参考 [如何连接Redux|How To Connect To Redux](/documents/HowToConnectToRedux.md) 和 [演示DEMO](/src/components/ReduxDemo/ReduxDemo.js)。