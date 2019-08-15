# 后端API文档

**目录**

[公共接口](#公共接口)

- ["/captcha"](#captcha)
- ["/login"](#login)
- ["/userAccounts/:uid"](#useraccountsuid)
- ["/userEmail"](#useremail)
- ["/username"](#username)
- ["/userProfiles/:uid"](#userprofilesuid)

[私有接口](#私有接口)

- ["/userPrivacies/:uid"](#userprivaciesuid)

---

- **注意**：所有的服务器接口都将返回一个字段 `{ msg: $String }`，用以指示本次请求的操作结果细节，还将返回 `{ errorDetail:$String }`。

## 公共接口

> 公共接口指默认不受JWT保护的地址，但可以进行手动进行JWT加护。

### "/captcha"

**GET**：比对验证码，获取比对结果。需要`ctx.session.captcha`。

```
@input { captcha: $String }
@output { success: $Boolean }
```

**POST**：新建并返回一个验证码，该验证码将被注册到`ctx.session.captcha`中；支持生成`math`表达式。

```
@input { type:$String['', 'math'] }
When success:
  @session { captcha: $String }
  @output { $svg }
Else:
  @output { success:$Boolean }
```

### "/login"

> 登录接口特殊，不符合RESTful的设计规范

**POST**：通过账号进行登录，返回一个登录是否成功的标志和服务器签发的Token。同时，username可作为email或phone登录。

```
@input { username: $String, password: $String, salt:$String, newSalt:$String, newPassword:$String  }
@output { success: $Boolean, token: $String }
```

### "/userEmail"

**GET**：输入一个userEmail，返回一个该userEmail是否存在的标志。

```
@input { userEmail: $String }
@output { exists: $Boolean }
```

### "/userAccounts/:uid"

> `${uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。

**GET**：用户查询，返回用户的账户信息，对权限有要求。当uid=0时通过过滤模式筛选所有符合要求的人信息。

```
When `ctx.params.{uid}` = 0:
  @input { filter: $Values }
    => filter contains :
      page: $int, // 当前页(必填)；从1起
      max: $int, // 每页最大数据量(必填)；最大为50
      // 下面两项至少需要一项
      username: $String, // 用户的 username 或 email 或 phone 或 openid (支持模糊检索)
      authority: $int, // 目标用户权限
Else:
  @input { / }
@output { result:$Array }
```

**POST**：即注册接口，返回一个注册是否成功的标志和服务器签发的Token。

```
* When do POST, only response on ".../userAccounts/0"
@input { username: $String, password: $String, salt: $String, captcha: $String }
@output { success: $Boolean, token: $String }
```

**PUT**：完全更改用户账户信息表的接口，对权限有要求。返回操作是否成功的标志。`ctx.params.{uid}` 为要更改的账号的UID。

```
@input {data: $Object => '{ username:$String, openid:$String, password:$String, salt:$String, authority:$Integer }'}
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

### "/username"

**GET**：输入一个username，返回一个该username是否存在的标志和相应的salt。
```
@input { username: $String }
@output { exists: $Boolean, salt: $String }
```

### "/userProfiles/:uid"

> `${uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。

**GET**：查询用户的资料，权限为管理组或本人时可以跳过隐私设定获取数据。
```
When `ctx.params.{uid}` = 0:
  @input { filter: $Values }
    => filter contains :
      page: $int, // 当前页(必填)；从1起
      max: $int, // 每页最大数据量(必填)；最大为50
      // 下面几项为可选项
      nickname: $String, // 支持模糊匹配
      sex: $String ['f', 'm', '?'],
      birthdayStart: $String, (含) -> 必须与 birthdayEnd 成对出现，否则不起效
      birthdayEnd: $String, (不含)
      company: $String, // 支持模糊匹配
      location: $String // 支持模糊匹配
Else:
  @input { / }
@output { result:$Array }
```


**PATCH**：更改用户的资料，权限需求为管理组或本人。`ctx.params.{uid}`。

```
@input { updateData: $Object } // 更改的值
@output { success: $Boolean }
```

## 私有接口

### "/userPrivacies/:uid"

> `${uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。


**GET**：获取某用户的各项隐私设定，权限需求为管理组或本人。`ctx.params.{uid}`。
```
@input { / }
@output { result: $Array }
```

**PATCH**：更改用户的隐私设定，权限需求为管理组或本人。`ctx.params.{uid}`。

```
@input { updateData: $Object } // 更改的值
@output { success: $Boolean }
```

