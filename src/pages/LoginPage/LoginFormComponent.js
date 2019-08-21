import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {slowHash, generateSalt} from '../../util/crypto-hash-tool.js';

import {Form, Icon, Input, Button, Checkbox, Divider} from 'antd';

import 'antd/es/form/style/index.css';
import 'antd/es/icon/style/index.css';
import 'antd/es/input/style/index.css';
import 'antd/es/button/style/index.css';
import 'antd/es/checkbox/style/index.css';
import 'antd/es/divider/style/index.css';

import 'antd/es/col/style/css'; // col & row
import 'antd/es/row/style/css'; // col & row

import Captcha from '../../components/util/Captcha.js';

/**
 * @function beforeSubmit(form)
 * @function afterSubmit(form, res, err)
 */
class LoginFormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.props.beforeSubmit = this.props.beforeSubmit || function () {
    };
    this.props.afterSubmit = this.props.afterSubmit || function () {
    };

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

  handleSubmit(e) {
    if(typeof e.preventDefault === 'function') e.preventDefault();
    this.props.form.validateFieldsAndScroll((err) => {
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
    let captcha = this.props.form.getFieldValue('captcha');
    axios
      .post("/papi/authorizationToken", {
        username,
        password: slowHash(salt, password),
        salt,
        newSalt,
        newPassword,
        captcha
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

  setCaptchaRef(element) {
    this.captcha = element;
  }

  refreshCaptcha() {
    this.captcha.refreshCaptcha(); // @See '../../components/util/Captcha.js'
  }

  asyncCaptchaValidator(rule, value, callback) {
    let that = this;
    if (this.state.captchaPass) return callback(); // 已经通过一次校验的验证码直接通过验证
    if (!value || `${value}`.length < 4) return callback(); // 不满足条件默认通过验证
    axios
      .post("/papi/captcha", {
        captcha: value,
        keepAlive: true
      })
      .then((res) => {
        that.setState({
          captchaPass: res.data.match
        });
        if (res.data.match) {
          callback();
        } else {
          callback('验证码不一致');
        }
      })
      .catch((err) => {
        console.error(err.response.data);
        callback('验证码已过期，请刷新验证码');
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
                  pattern: /^\w{6,16}$|^1\d{10}$|^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  message: '应输入账户名(6-16位长)、绑定邮箱或手机号'
                }
              ]
            })(
              <Input
                prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder="请输入账户名/绑定邮箱/手机号"
                onPressEnter={this.handleSubmit}
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
                onPressEnter={this.handleSubmit}
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
                onPressEnter={this.handleSubmit}
              />
            )}
          </Form.Item>

          {this.state.captchaPass ? null :
            <Form.Item>
              <div align="center">
                <b style={{'float': 'left'}}>验证码：</b>
                <button className={'link-button'} style={{'float': 'right'}} onClick={this.refreshCaptcha}>
                  点击刷新
                </button>
                <Captcha ref={this.setCaptchaRef}/>
              </div>

            </Form.Item>
          }

          <Form.Item>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(<Checkbox>记住我的登录状态</Checkbox>)}

            <Link to="/pages/retrieve_password" style={{'float': 'right'}}>
              忘记密码？
            </Link>

            <Button type="primary" style={{'width': '100%'}} onClick={this.handleSubmit}>
              登&nbsp;录
            </Button>
            或者 <Link to="/pages/register">即刻快速注册成为会员!</Link>
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