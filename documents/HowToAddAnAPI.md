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
  ctx.response.body = addFunc(1, 2);
  return next();
});
```

你也可以把`function add(a, b)`编写为一个异步函数，并直接进行注册：
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

像上文中所提到的那样，先要把业务逻辑作为一个异步函数，然后在`/server/controller/api-router.js`文件中进行表注册。

注册表`API_ROUTER_TABLE`的各项值如下:

字段|意义|类型|样例
:-:|:-:|:-:|:-:
methods|对应的HTTP方法|array| [METHOD_GET, METHOD_POST]
service|业务对象|async function|async (ctx, next) => {}

注册时采用的键值即为其路由表的地址。

如：
```
"/apiExample": {
    methods: [METHOD_GET, METHOD_POST],
    service: async (ctx, next) => {
      console.log("/api/apiExample body", ctx.request.body);
      console.log("/api/apiExample query", ctx.request.query);
      ctx.body = ctx.request.body ? ctx.request.body : ctx.request.query;
      return next();
    }
  }
```
将会暴露"GET"和"POST"方法到`/api/apiExample`。
