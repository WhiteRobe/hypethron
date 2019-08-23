# 后端API文档

**名词解释**

- **@input** 参数输入
- **@output** 参数输出
- **@params** 地址参数输入，等价于"@url-params"
- **@set-params** 尝试向url设置一个参数
- **@redirect** 重定向到地址
- **@set-cookies** 服务器尝试设置一个`cookies`
- **@need-cookies** 服务器尝试读一个`cookies`
- **@set-session**  接口向服务器`session`中存入一个的值
- **@need-session** 接口需要读服务器`session`中存储的值
- **@set-head**  接口将会设置一个`response-head`
- **@need-head** 接口需要读一个`request-head`
- **@random-value<id>** 指示，标记一个随机的值及其在上下文中的`id`
- **@throw** 指示，标记可能抛出的错误码和原因(400错误默认不进行标记)
- **@throws** 指示，接口函数可能抛出的异常`Exception`
- **@annotation[key]** 指示，从注解(annotation)中取`key`所指示的值
- **@get-from** 指示，告知该值的取值范围从何API处获得
- **key:value** 标记一个键值对
- **$String/Object/JSON-String...** 指示，标记某个字段的值类型
- **$Type/Key<const-value>** (补充上条)指示，一个指定的类型(Type)或字段(Key)的常量值`const-value`
- **<opt>$Params** 指示，标记一个可选的参数项Params
- **<opt@domain:±n>** (扩展上条)指示，标记domain中几个互斥的的参数项，至多(+)/至少(-)只能有n个
- **<token>@subject/...=>value** 指示，标记一个JWT Token的某项约束值，如`subject`

---

**目录**

[公共接口](#公共接口)

- ["/authorizationToken"](#authorizationtoken)
- ["/apiDocument"](#apidocument)
- ["/captcha"](#captcha)
- ["/emailCaptcha"](#emailcaptcha)
- ["/passwordRetrieveCert"](#passwordretrievecert)
- ["/restfulStatus"](#restfulstatus)
- ["/userAccounts/:uid"](#useraccountsuid)
- ["/userEmailExistence"](#useremailexistence)
- ["/usernameExistence"](#usernameexistence)
- ["/userProfiles/:uid"](#userprofilesuid)
- ["/userSalts"](#usersalts)

[私有接口](#私有接口)

- ["/userPrivacies/:uid"](#userprivaciesuid)

---

## 公共接口

> 公共接口指默认不受JWT保护的地址，但可以进行手动进行JWT加护。

### "/authorizationToken"

**POST**：通过账号进行登录，返回一个登录是否成功的标志即服务器签发的Token，并尝试写入cookies。同时，username可作为email或phone登录。每次调用都会清空session里的captcha。

```
@input { username: $String, password: $String, salt:$String, newSalt:$String, newPassword:$String, captcha: $String }
@need-session { captcha: <token@subject:captcha> => captcha: $String }
@set-cookies { Authorization: <token>@subject:authorization => { uid: $Int, authority: $Int } }
@output { token: $String }
@throw {403: 认证不通过, 404:session数据丢失, 406: 验证码不匹配, 409: session验证码jwt检验不通过 }
```

### "/apiDocument"

**GET**：输出后端接口文档

```
@input { / }
@output { html/text }
```

### "/captcha"

**GET**：新建并返回一个验证码，该验证码将被注册到`ctx.session.captcha`中；支持生成`math`表达式。

```
@input { type:$String['text', 'math'], captchaLength<opt>: $Int }
@set-session { captcha: <token@subject:captcha> => captcha: $String }
@output { $svg } 一个svg数据 <img src=".../captcha"/>
@throw { 409: 生成验证码失败 }
```


**POST**：比对验证码，获取比对结果。比对成功将清除所记录的captcha，可设置$keepAlive=true使其不被清除。

```
@need-session { captcha: <token@subject:captcha> => captcha: $String }
@input { captcha: $String, <opt>keepAlive: $Boolean }
@output { match: $Boolean }
@throw { 404:session数据丢失, 409: session验证码jwt检验不通过 }
```

### "/emailCaptcha"

**GET**：校验一个邮箱验证码是否正确。除非设置keepAlive为true，否则验证通过后将会销毁这个email-captcha。如果给出email地址，还会进行严格模式的校验，即校验email是否发生变动。

```
@input { emailCaptcha: $String, <opt>email:$String, <opt>keepAlive: $Boolean }
@need-session { emailCaptcha: <token@subject:emailCaptcha> =>  { email: $String, captcha: $String }}
@output { match: $Boolean }
@throw { 404:session数据丢失, 406: 与该emailCaptcha对应的email不是同一个地址, 409: session验证码jwt检验不通过 }
```

**POST**：发送一个邮箱验证码，该验证码和对应的邮箱将被注册到`ctx.session.emailCaptcha`中。操作成功后captcha会被清除。

```
@need-session { captcha: <token@subject:captcha> => captcha: $String }
@input { email: $String, captcha: $String, <opt>type:$String<@get-from:http.options> }
@set-session { emailCaptcha: <token@subject:emailCaptcha> =>  { email: $String, captcha: $String }}
@output { success: $Boolean<true> }
@throw { 404:session数据丢失, 409: session验证码jwt检验不通过, 502: 发送邮件失败 }
```

### "/passwordRetrieveCert"


**POST**：申请找回密码，向绑定的邮箱发送一份邮件，以获得相应的认证`retrievePWCert`。

```
@input { email: $String, captcha: $String }
@need-session { captcha: <token@subject:captcha> => captcha: $String }
@set-params { retrievePWCert: $String<@random-value<1>> }
@set-session { @set-params[retrievePWCert]: <token@subject:retrievePWCert> => uid: $Int }
@output { success: $Boolean<true> }
@throw {403: 认证不通过(无此账号), 404:session数据丢失, 406: 验证码不匹配, 409: session验证码jwt检验不通过, 502: 发送邮件失败 }
```

**PATCH**：根据`retrievePWCert`的值从session中获得相应的jwt-token证明并验证身份，若通过则重设密码。操作后，200状态下retrievePWCert会被清除。

```
@input { password: $String, salt: $String, retrievePWCert: $String }
@need-session { @input[retrievePWCert]: <token@subject:retrievePWCert> => uid: $Int }
@output { success: $Boolean }
@throw { 404:session数据丢失, 409: session数据jwt检验不通过 }
```

### "/restfulStatus"

**GET**：获取状态码的说明.

```
@output { result:$JSON-String }
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
@throw { 401: 缺失认证信息, 403: 权限不足, 409: 权限jwt验证不通过 }
```

**POST**：即注册接口，返回一个注册是否成功的标志即服务器签发的Token，并尝试写入session-cookies。注册成功后清空session

```
* When do POST, only response on ".../userAccounts/0"
@need-session { emailCaptcha: <token@subject:emailCaptcha> =>  { email: $String, captcha: $String }}
@input { username: $String, password: $String, salt: $String, emailCaptcha: $String }
@set-cookies { Authorization: <token>@subject:authorization => { uid: $Int, authority: $Int } }
@output { token: $String }
@throw { 403: 权限不足, 404: 缺失session数据, 406: 验证码不匹配, 409: jwt验证不通过, 502: 未知原因导致的写表错误 }
```

**PATCH**：部分更改用户账户信息表的接口，对权限有要求。返回操作是否成功的标志。

```
@params { uid: $String }
@input { updateData: $Object => '{ username:$String, openid:$String, password:$String, salt:$String, authority:$Integer }'}
@output { success: $Boolean }
@throw { 401: 缺失认证信息, 403: 权限不足, 409: 权限jwt验证不通过 }
```

**DELETE**：删除用户账户信息表(及级联表)的接口，对权限有要求。返回操作是否成功的标志。

```
@params { uid: $Int }
@input { / }
@output { success: $Boolean<true> }
@throw { 401: 缺失认证信息, 403: 权限不足, 409: 权限jwt验证不通过 }
```

### "/usernameExistence"

**GET**：输入一个username，返回一个该username是否存在的标志。
```
@input { username: $String }
@output { exists: $Boolean }
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
  @input { <opt>only: $Array } 只获取规定字段的项
@output { result:$Array }
@throw { 409: 认证token的jwt检验不通过 }
```


**PATCH**：更改用户的资料，权限需求为管理组或本人。

```
@params { uid: $Int }
@input { updateData: $Object } // 更改的值
@output { success: $Boolean }
@throw { 401: 缺少认证, 403: 权限不足, 409: 认证token的jwt检验不通过 }
```

### "/userSalts"

**GET**：输入一个 username，返回一个该username的盐。username还可以是email或phone。

```
@input { username: $String }
@output { salt: $String }
@throw { 403: 用户不存在 }
```


## 私有接口

### "/userPrivacies/:uid"

> `${uid}` 为用户的统一标识符，是一个大于1的整数；部分动词只对特殊的UID进行响应。


**GET**：获取某用户的各项隐私设定，权限需求为管理组或本人。
```
@params { uid: $Int }
@input { / }
@output { result: $Array }
@throw { 401: 缺少认证, 403: 权限不足, 409: 认证token的jwt检验不通过 }
```

**PATCH**：更改用户的隐私设定，权限需求为管理组或本人。

```
@params { uid: $Int }
@input { updateData: $Object } // 更改的值
@output { success: $Boolean }
@throw { 401: 缺少认证, 403: 权限不足, 409: 认证token的jwt检验不通过 }
```


---

[返回首页](/README.md)

