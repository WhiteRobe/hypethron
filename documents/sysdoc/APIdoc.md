# 后端API文档

**目录**

[公共接口](#公共接口)

- ["/username"](#username)
- ["/login"](#login)

[私有接口](#私有接口)


---

> 所有的服务器接口都将返回一个字段 { msg: $String, (如果发生错误)errorDetail:$String }，用以指示本次请求的操作结果细节，下文不再列出。

### 公共接口

#### "/username"

**GET**：输入一个username，返回一个该username是否存在的标志和相应的salt
```
@input { username: $String }
@output { exists: $Boolean, salt: $String }
```

#### "/login"

> 登录接口特殊，不符合RESTful的设计规范

**POST**：通过账号进行登录，返回一个登录是否成功的标志和服务器签发的Token

```
@input { username: $String, password: $String,  }
@output { success: $Boolean, token: $String }
```


### 私有接口

