# 如何新增一个接口


> 虽然系统采用**RESTful**的形式定义接口，但如果你对RESTful并不熟悉，在二次开发中并不太需要严格死守这条规定。

## 手动注册

### ① 业务逻辑

在目录`/server/controller`中，存放着所有业务层逻辑，你需要在此处新增你的业务逻辑。

在通常情况下，你可以直接操作`koa-router`中间件完成服务的注册。这里以一个求和业务为例子：
```
// # 新增文件 Add.js
function add(a, b){
  return a+b;
}
module.exports = add;
```

> 注意：在服务器的二次开发过程中，你需要采用ES5的语法来编写这些内容。

### ② 接口注册

接着，你需要为这个业务逻辑进行地址注册。

打开`/server/controller/api-router.js`文件，将这个业务逻辑注册到`GET /api/addServer`：

```
// # 添加以下代码：
const addFunc = require('./Add.js');

// ....Origin Code Here

apiRouter.get("/addServer", async (ctx, next) =>{
  ctx.response.body = addFunc(1, 2); // 由于原业务函数非异步函数，因此需以委托模式进行调用
  return next(); // 请一定要注意调用next()方法
});
```

如果不想以委托模式进行函数调用，你也可以把`function add(a, b)`编写为一个异步函数，并直接进行注册：
```
// 添加业务逻辑
async function add(ctx, next){
  await let a,b = doingSomthingToGetAB(ctx);
  return a+b;
}

// ......

// 在api-router.js中注册
apiRouter.get("/addServer", add);
```

> 需要注意的是, "POST|PUT|PATCH"方法需要手动注入[KoaBody依赖](https://www.npmjs.com/package/koa-body)；如果你没有特别的定制需求，我们推荐你采用表注册的方式添加接口。

## 表注册

- 表注册是一种更简单的约束形API注册方式。它可以简化和规范化上文中[手动注册]的各种步骤。

进行表注册时，像上文中所提到的那样，你需要把业务逻辑作为一个异步函数，然后在`/server/controller/api-router.js`文件中进行表注册。

> 注意：添加异步函数时，一定要在所有函数的出口显式调用`next()`方法。

注册表`API_ROUTER_TABLE`的各项值如下:

字段|意义|类型|样例
:-:|:-:|:-:|:-:
methods|对应的HTTP方法|array| [METHOD_GET, METHOD_POST]
services|业务对象|array[async function]|async (ctx, next) => {}

注册时采用的键值即为其路由表的地址。如：

```
"/apiExample": {
    methods: [METHOD_GET], // 绑定GET方法，你也可以添加多个方法
    service: [async (ctx, next) => { // 具体的业务逻辑
      console.log("/api/apiExample body", ctx.request.body);
      console.log("/api/apiExample query", ctx.request.query);
      ctx.body = ctx.request.body ? ctx.request.body : ctx.request.query;
      return next();
    }]
  }
```
将会暴露"GET"和"POST"方法到`/api/apiExample`。

---

在`/server/util`中我们提供了新的工具包，你只需要导入该工具包，即可以更方便的方式绑定接口，如: `const binder = require("../util/api-binder.js")`

你现在只需要定义相关业务函数，如`echo.js`：

```
const binder = require("/util/api-binder.js");

// 需要以HTTP方法名开头，以下划线作方法名切分
async function GET_echo(ctx, next) {
  ctx.body = "服务器已收到：" + ctx.request.query ;
  return next();
}

async function POST_echo(ctx, next) {
  ctx.body = "服务器已收到：" + ctx.request.body;
  return next();
}

module.exports = binder({
  GET_echo,
  POST_echo
});
```

在 `/server/controller/api-router.js` 的路由表中进行绑定只需要：

```
const echo = require('./echo.js');
const API_ROUTER_TABLE = {
  //...
  "/echo": echo
};
```

## 映射表及访问控制

在 `/server/controller/api-router.js` 的存在两份路由表，其中:
- `API_ROUTER_TABLE` 将绑定受到JWT保护的服务器地址，所有内容将被映射到`/api`路径下。
- `PUBLIC_API_ROUTER_TABLE` 公共接口不受JWT保护，所有内容将被映射到`/papi`路径下。

如果您有二次开发的需要：
访问控制配置可到[`/server/server-configure.js`](/server/server-configure.js)中进行自定义。
映射地址请在[`/server/server-router.js`](/server/server-router.js)中进行自定义。

> 如果您不了解什么是JWT，请参考此处：[https://jwt.io/](https://jwt.io/)

### 路由架构

应用路由架构如下图所示：

<p align="center">
    <img src="/documents/pics/router-structure.png"/>
</p>

详见: [文档-前后端路由交叉](/documents/sysdoc/SystemStructure.md#前后端路由交叉)