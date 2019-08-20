import React from 'react';
import axios from 'axios';
import {slowHash, generateSalt} from '../../util/crypto-hash-tool.js';

import {Form, Icon, Input, Button, Checkbox, Divider} from 'antd';
import 'antd/es/divider/style/index.css';
import 'antd/es/checkbox/style/index.css';
import 'antd/es/input/style/index.css';
import 'antd/es/form/style/index.css';
import 'antd/es/button/style/index.css';
import 'antd/es/icon/style/index.css';
import 'antd/es/style/index.css'; // col & row
import 'antd/es/layout/style/index.css';

import Captcha from '../../components/util/Captcha.js';

/**
 * @function beforeSubmit(form)
 * @function afterSubmit(form, res, err)
 */
class LoginFormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      captchaPass: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getUserSalt = this.getUserSalt.bind(this);
    this.login = this.login.bind(this);
    this.refreshCaptcha = this.refreshCaptcha.bind(this);
    this.setCaptchaRef = this.setCaptchaRef.bind(this);
    this.asyncCaptchaValidator = this.asyncCaptchaValidator.bind(this);
  }

  handleSubmit() {
    this.props.form.validateFields((err) => {
      if (err) {
        console.error(err);
      } else {
        this.login().then(/* ignored */);
      }
    });
  };

  getUserSalt(username) {
    return new Promise((resolve, reject) => {
      axios.get("/papi/userSalts", {
        params: {
          username
        }
      }).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    })
  }

  async login() {
    let that = this;
    let returnRes, returnErr;
    this.props.beforeSubmit(that.props.form);

    let username = this.props.form.getFieldValue('username');
    let password = this.props.form.getFieldValue('password');
    let salt = await this.getUserSalt(username).catch(err => { // 先拿到用户的盐
      that.props.afterSubmit(that.props.form, returnRes, err);
    });
    if (!salt) return;
    else {
      salt = salt.data.salt;
    }
    let newSalt = generateSalt(16);
    let newPassword = slowHash(newSalt, password);

    axios
      .post("/papi/authorizationToken", {
        username,
        password: slowHash(salt, password),
        salt,
        newSalt,
        newPassword
      })
      .then((res) => {
        returnRes = res;
      })
      .catch((err) => {
        returnErr = err;
      })
      .finally(() => {
        if (returnErr) { // 登录失败时重启验证码机制
          that.props.form.setFieldsValue({'captcha': ''}); // 清空验证码
          that.setState({
            captchaPass: false,
          });
          this.refreshCaptcha();
        }
        that.props.afterSubmit(that.props.form, returnRes, returnErr);
      });
  }

  setCaptchaRef(element){
    this.captcha = element;
  }

  refreshCaptcha(){
    this.captcha.refreshCaptcha(); // @See '../../components/util/Captcha.js'
  }

  asyncCaptchaValidator(rule, value, callback) {
    let that = this;
    if (this.state.captchaPass) return callback(); // 校验过一次的验证码直接通过验证
    if (!value || `${value}`.length < 4) return callback(); // 不满足条件默认通过验证
    axios
      .post("/papi/captcha", {
        captcha: value
      })
      .then((res) => {
        that.setState({
          captchaPass: res.data.success
        });
        if (res.data.success) {
          callback();
        } else {
          callback('验证码不相同或已过期');
        }
      })
      .catch((err) => {
        callback('验证码不相同或已过期');
      });
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <div>
        <Form style={{'max-width': '425px'}}>

          <Form.Item>
            {getFieldDecorator('username', {
              rules: [
                {required: true, message: '请输入账户名/绑定邮箱/手机号!'},
                {
                  type: 'string',
                  pattern: /^\w{6,16}$|^1\d{10}$|^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                  message: '应输入账户名(6-16位长)、绑定邮箱或手机号'
                }
              ]
            })(
              <Input
                prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder="请输入账户名/绑定邮箱/手机号"
              />
            )}
          </Form.Item>

          <Form.Item>
            {getFieldDecorator('password', {
              rules: [
                {required: true, message: '请输入密码', min: 6, max: 16},
                {min: 6, max: 16, message: '密码长度应为6~16(含)'},
                {type: 'string', pattern: /\d+/, message: '密码应至少包含一位数字'},
                {type: 'string', pattern: /[a-zA-Z]+/, message: '密码应至少包含一位大小写英文'},
                {type: 'string', pattern: /^\w+$/, message: '密码应为英文、数字等非制表符混合串'}
              ]
            })(
              <Input
                prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                type="password"
                placeholder="请输入密码"
              />
            )}
          </Form.Item>

          <Form.Item validateStatus={this.state.captchaPass ? 'success' : 'warning'}
                     hasFeedback={this.state.captchaPass}>
            {getFieldDecorator('captcha', {
              rules: [
                {required: true, len: 4, message: '请输入4位验证码'},
                {
                  asyncValidator: this.asyncCaptchaValidator
                }
              ]
            })(
              <Input
                prefix={<Icon type="safety" style={{color: 'rgba(0,0,0,.25)'}}/>}
                maxlength="4"
                placeholder="请输入验证码"
                disabled={this.state.captchaPass}
              />
            )}
          </Form.Item>

          {this.state.captchaPass ? null :
            <Form.Item>
              <div align="center">
                <b style={{'float': 'left'}}>验证码：</b>
                <button className={'link-button'} style={{'float': 'right'}} onClick={this.refreshCaptcha}>
                  点击刷新
                </button >
                <Captcha ref={this.setCaptchaRef}/>
              </div>

            </Form.Item>
          }

          <Form.Item>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(<Checkbox>记住我的登录状态</Checkbox>)}

            <a href="/pages/retrieve_password" style={{'float': 'right'}}>
              忘记密码？
            </a>

            <Button type="primary" style={{'width': '100%'}} onClick={this.handleSubmit}>
              登&nbsp;录
            </Button>
            或者 <a href="/pages/register">即刻快速注册成为会员!</a>
          </Form.Item>

        </Form>

        <Divider>第三方登录</Divider>

        <div align="center">
          {/*<Icon type="qq" theme="twoTone" twoToneColor="#00b0fb"/>*/}
          <Icon type="qq"/>
          <Divider type="vertical"/>
          {/*<Icon type="wechat" theme="twoTone" twoToneColor="#46d800"/>*/}
          <Icon type="wechat"/>
          <Divider type="vertical"/>
          <Icon type="github"/>
        </div>
      </div>
    );
  }
}

// const WrappedLoginFormComponent = Form.create({name: 'normal_login_form'})(LoginFormComponent);

export default LoginFormComponent;