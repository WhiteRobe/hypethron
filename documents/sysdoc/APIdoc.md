# 后端API文档

**目录**

[公共接口](#公共接口)

- ["/authorizationToken"](#authorizationtoken)
- ["/captcha"](#captcha)
- ["/emailCaptcha"](#emailcaptcha)
- ["/userAccounts/:uid"](#useraccountsuid)
- ["/userEmailExistence"](#useremailexistence)
- ["/usernameExistence"](#usernameexistence)
- ["/userProfiles/:uid"](#userprofilesuid)

[私有接口](#私有接口)

- ["/userPrivacies/:uid"](#userprivaciesuid)

---

## 公共接口

> 公共接口指默认不受JWT保护的地址，但可以进行手动进行JWT加护。

### "/authorizationToken"

**POST**：通过账号进行登录，返回一个登录是否成功的标志即服务器签发的Token，并尝试写入cookies。同时，username可作为email或phone登录。

```
@input { username: $String, password: $String, salt:$String, newSalt:$String, newPassword:$String }
@set-cookies { @Authorization: authorizationToken }
@output { token: $String }
```

### "/captcha"

**GET**：比对验证码，获取比对结果。比对成功将清除所记录的captcha。

```
@need-session { captcha: $String }
@input { captcha: $String }
@output { success: $Boolean }
```

**POST**：新建并返回一个验证码，该验证码将被注册到`ctx.session.captcha`中；支持生成`math`表达式。

```
@input { type:$String['', 'math'] }
@session { captcha: $String }
@output { $svg }
```

### "/emailCaptcha"

**POST**：发送一个邮箱验证码。

```
@need-session { captcha: $String }
@input { email: $String, captcha: $String }
@session { emailForBind: $String, captchaForBind: $String }
@output { success: $Boolean}
```


### "/userEmailExistence"

**GET**：输入一个userEmail，返回一个该userEmail是否存在的标志。

```
@input { userEmail: $String }
@output { exists: $Boolean }
```

### "/userAccounts/:uid"

> `${uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。

**GET**：用户查询，返回用户的账户信息，对权限有要求。当uid=0时通过过滤模式筛选所有符合要求的人信息。

```
@params { uid: $Int}
When `ctx.params.{uid}` = 0:
  @input { filter: $Values }
    => filter contains :
      page: $int, // 当前页(必填)；从1起
      max: $int, // 每页最大数据量(必填)；最大为50
      // 下面两项为可选项
      username: $String, // 用户的 username 或 email 或 phone 或 openid (支持模糊检索)
      authority: $int, // 目标用户权限
Else:
  @input { / }
@output { result:$Array }
```

**POST**：即注册接口，返回一个注册是否成功的标志即服务器签发的Token，并尝试写入session-cookies。

```
* When do POST, only response on ".../userAccounts/0"
@need-session { captcha: $String, captchaForBind: $String }
@input { username: $String, password: $String, salt: $String, captcha: $String }
@set-cookies { @Authorization: authorizationToken }
@output { token: $String }
```

**PATCH**：部分更改用户账户信息表的接口，对权限有要求。返回操作是否成功的标志。

```
@params { uid: $String }
@input { updateData: $Object => '{ username:$String, openid:$String, password:$String, salt:$String, authority:$Integer }'}
@output { success: $Boolean }
```

**DELETE**：删除用户账户信息表(及级联表)的接口，对权限有要求。返回操作是否成功的标志。

```
@params { uid: $Int }
@input { / }
@output { success: $Boolean }
```

### "/usernameExistence"

**GET**：输入一个username，返回一个该username是否存在的标志和相应的salt。
```
@input { username: $String }
@output { exists: $Boolean, salt: $String }
```

### "/userProfiles/:uid"

> `${uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。

**GET**：查询用户的资料，权限为管理组或本人时可以跳过隐私设定获取数据。
```
@params { uid: $Int }
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


**PATCH**：更改用户的资料，权限需求为管理组或本人。

```
@params { uid: $Int }
@input { updateData: $Object } // 更改的值
@output { success: $Boolean }
```

## 私有接口

### "/userPrivacies/:uid"

> `${uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。


**GET**：获取某用户的各项隐私设定，权限需求为管理组或本人。
```
@params { uid: $Int }
@input { / }
@output { result: $Array }
```

**PATCH**：更改用户的隐私设定，权限需求为管理组或本人。

```
@params { uid: $Int }
@input { updateData: $Object } // 更改的值
@output { success: $Boolean }
```

