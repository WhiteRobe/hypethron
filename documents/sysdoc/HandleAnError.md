# 错误处理

`/server/util/errorHandler.js`中的 `errorHandler` 和 `afterErrorHandler` 分别为异常抛出后进行处理的两个钩子函数。

## 抛出异常

```
// koa(ctx) =>
    ctx.throw(httpStatus, [errorMessage, properties]);
```

## 附加的信息字段

```
// koa(ctx) =>
    ctx.throw(httpStatus, ..., {detail: $String});
```

这个方法所附加的`detail`字段将可以向前端额外发送一段信息，如：

```
ctx.throw(403, {detail: "禁止访问"});

// >>> Forbidden
// >>> {禁止访问}
```

这个方法可以用作i18n的接口。

---

[返回首页](https://github.com/WhiteRobe/hypethron)