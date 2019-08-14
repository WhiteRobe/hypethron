# 后端API文档

**目录**

[公共接口](#公共接口)

- ["/captcha"](#captcha)
- ["/login"](#login)
- ["/username"](#username)
- ["/userAccounts/:uid"](#useraccountsuid)

[私有接口](#私有接口)


---

- **注意**：所有的服务器接口都将返回一个字段 `{ msg: $String }`，用以指示本次请求的操作结果细节，还将返回 `{ errorDetail:$String }`。

## 公共接口

> 公共接口指默认不受JWT保护的地址，但可以进行手动进行JWT加护。

### "/captcha"

**GET**：比对验证码，获取比对结果。

```
@input { captcha: $String }
@output { success: $Boolean }
```

**POST**：新建并返回一个验证码，该验证码将被注册到`ctx.session.captcha`中；支持生成`math`表达式。

```
@input { type:$String['', 'math'] }
When success:
  @output { $svg }
Else:
  @output { success:$Boolean }
```

### "/login"

> 登录接口特殊，不符合RESTful的设计规范

**POST**：通过账号进行登录，返回一个登录是否成功的标志和服务器签发的Token。

```
@input { username: $String, password: $String, salt:$String, newSalt:$String, newPassword:$String  }
@output { success: $Boolean, token: $String }
```

### "/username"

**GET**：输入一个username，返回一个该username是否存在的标志和相应的salt。
```
@input { username: $String }
@output { exists: $Boolean, salt: $String }
```

### "/userAccounts/:uid"

> `${uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。

**GET**：用户查询，返回用户的账户信息，对权限有要求。当uid=0时通过过滤模式筛选所有符合要求的人信息。

```
When `ctx.params.{uid}` = 0:
  @input { filter: $Values }
    => filter: {      page: $int, // 当前页(必填)；从1起
    max: $int, // 每页最大数据量(必填)；最大为50
    // 下面两项至少需要一项
    username: $String, // 用户的 username 或 account 或 openid (支持模糊检索)
    authority: $int, // 目标用户权限
  }
Else:
  @input { / }
@output { result:$Array }
```

**POST**：即注册接口，返回一个注册是否成功的标志和服务器签发的Token。

```
* When do POST, only response on ".../userAccounts/0"
@input { username: $String, account: $String,  password:$String, salt:$String }
@output { success: $Boolean, token: $String }
```

**PUT**：完全更改用户账户信息表的接口，对权限有要求。返回操作是否成功的标志。`ctx.params.{uid}` 为要更改的账号的UID。

```
@input { username:$String, account:$String, openid:$String, password:$String, salt:$String, authority:$Integer }
@output { success: $Boolean }
```

**PATCH**：部分更改用户账户信息表的接口，对权限有要求。返回操作是否成功的标志。`ctx.params.{uid}` 为要更改的账号的UID。

```
@input { username:$String, account:$String, openid:$String, password:$String, salt:$String, authority:$Integer }
@output { success: $Boolean }
```

**DELETE**：删除用户账户信息表(及级联表)的接口，对权限有要求。返回操作是否成功的标志。`ctx.params.{uid}` 为要删除账号的UID。

```
@input { / }
@output { success: $Boolean }
```

## 私有接口

