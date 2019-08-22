import React from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import {slowHash, generateSalt} from '../../util/crypto-hash-tool.js';

import {Form, Icon, Input, Button, Checkbox, notification, Statistic, Spin, Row, Col} from 'antd';

import 'antd/es/form/style/index.css';
import 'antd/es/icon/style/index.css';
import 'antd/es/input/style/index.css';
import 'antd/es/button/style/index.css';
import 'antd/es/checkbox/style/index.css';
import 'antd/es/notification/style/index.css';
import 'antd/es/statistic/style/index.css';
import 'antd/es/spin/style/index.css';

import 'antd/es/style/index.css' // col & row
import 'antd/es/grid/style/index.css' // col & row

import Captcha from '../../components/util/Captcha.js';

const {Countdown} = Statistic;

/**
 * @function beforeSubmit(form)
 * @function afterSubmit(form, res, err)
 */
class RegisterFormComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false, // 载入遮罩
      emailValid: false, // 邮箱是否已通过检测
      sendEmailCooldown: true, // 发送邮箱验证邮件冷却
      cooldownTime: 0, // 发送邮箱验证邮件冷却时间
      emailCaptcha: '' // 邮件验证码的Cache
    };

    this.toggleLoadingState = this.toggleLoadingState.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.register = this.register.bind(this);
    this.sendEmailCaptcha = this.sendEmailCaptcha.bind(this);
    this.asyncUsernameValidator = this.asyncUsernameValidator.bind(this);
    this.asyncUserEmailValidator = this.asyncUserEmailValidator.bind(this);
    this.asyncCaptchaValidator = this.asyncCaptchaValidator.bind(this);
    this.asyncEmailCaptchaValidator = this.asyncEmailCaptchaValidator.bind(this);
    this.compareToFirstPassword = this.compareToFirstPassword.bind(this);
    this.setCaptchaRef = this.setCaptchaRef.bind(this);
    this.refreshCaptcha = this.refreshCaptcha.bind(this);
    this.onCooldownFinish = this.onCooldownFinish.bind(this);
  }

  toggleLoadingState() {
    let state = this.state.loading;
    this.setState({
      loading: !state
    });
  }

  handleSubmit(e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    this.props.form.validateFields((err) => {
      if (err) {
        console.error(err);
      } else {
        this.register();
      }
    });
  };

  register() {
    let that = this;
    let returnRes, returnErr;
    this.props.beforeSubmit(that.props.form);

    let username = this.props.form.getFieldValue('username');
    let password = this.props.form.getFieldValue('password');
    let salt = generateSalt(16);
    let emailCaptcha = this.state.emailCaptcha;

    axios
      .post("/papi/userAccounts/0", {
        username,
        password: slowHash(salt, password),
        salt,
        emailCaptcha
      })
      .then((res) => {
        returnRes = res;
      })
      .catch((err) => {
        returnErr = err;
      })
      .finally(() => {
        that.props.afterSubmit(that.props.form, returnRes, returnErr);
      });
  }

  sendEmailCaptcha(e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    let that = this;
    this.props.form.validateFieldsAndScroll(['userEmail', 'captcha'], (err, values) => {
      if (!err) {
        that.toggleLoadingState();
        axios
          .post("/papi/emailCaptcha", {
            email: values['userEmail'],
            captcha: values['captcha'],
            type: 'register'
          })
          .then(res => {
            if (res.data.success) {
              that.setState({ // 令其进入冷却时间
                sendEmailCooldown: false,
                cooldownTime: Date.now() + 1000 * 60 * 3, // 冷却时间3分钟
              });
              console.log(`发送邮箱绑定验证邮件:${res.data.success}，发送至${values['userEmail']}`);
            } else {
              notification.warn({
                message: `发送邮箱绑定验证邮件失败`,
                description: '可能是服务器正忙，请稍后再试！',
                duration: 3
              })
            }
          })
          .catch(err => {
            console.error(err.response.data);
            notification.warn({
              message: `发送邮箱绑定验证邮件失败`,
              description: '请检查您的输入是否正确，或稍后尝试！',
              duration: 3
            })
          })
          .finally(() => {
            that.toggleLoadingState();
          });
      }
    });
  }

  asyncUsernameValidator(rule, value, callback) {
    let username = this.props.form.getFieldValue('username');
    if (!username) return callback(); // 空值交给上一条校验处理
    if (!/^\w{6,16}$/.test(username)) return callback('账户名应为6-16位长的英文数字混合字符串'); // 正则没通过前无视异步AJAX验证
    axios
      .get("/papi/usernameExistence", {
        params: {
          username
        }
      })
      .then((res) => {
        if (res.data.exists) {
          callback('该用户名已存在');
        } else {
          callback();
        }
      })
      .catch((err) => {
        callback('服务器错误，请刷新重试');
      });
  }

  asyncUserEmailValidator(rule, value, callback) {
    let userEmail = this.props.form.getFieldValue('userEmail');
    // emailReg @asyncValidate /rule/type
    let emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailReg.test(userEmail)) return callback(); // 正则没通过前无视异步AJAX验证
    axios
      .get("/papi/userEmailExistence", {
        params: {
          userEmail
        }
      })
      .then((res) => {
        if (res.data.exists) {
          callback('该邮箱已被其它用户绑定');
        } else {
          callback();
        }
      })
      .catch((err) => {
        callback('服务器错误，请刷新重试');
      });
  }

  asyncCaptchaValidator(rule, value, callback) {
    if (!value || value.length < 4) return callback(); // 达到额定长度前不进行AJAX
    let captcha = this.props.form.getFieldValue('captcha');
    console.log(captcha);
    axios
      .post("/papi/captcha", {
        captcha,
        keepAlive: true
      })
      .then(res => {
        if (res.data.match) {
          return callback();
        } else {
          return callback('验证码不一致');
        }
      })
      .catch(err => {
        console.error(err.response.data);
        return callback('验证码已过期，请刷新验证码');
      });
  }

  asyncEmailCaptchaValidator(rule, value, callback) {
    let that = this;
    if (!value || value.length < 6) return callback(); // 达到额定长度前不进行AJAX
    let emailCaptcha = this.props.form.getFieldValue('emailCaptcha');
    let userEmail = this.props.form.getFieldValue('userEmail');
    axios
      .get("/papi/emailCaptcha", {
        params: {
          emailCaptcha,
          email: userEmail,
          keepAlive: true
        }
      })
      .then(res => {
        if (res.data.match) {
          that.setState({emailValid: true, emailCaptcha}); // 通过验证，缓存 emailCaptcha 的值
          return callback();
        } else {
          return callback('验证码不一致');
        }
      })
      .catch(err => {
        console.error(err.response.data);
        return callback('服务器错误，请刷新验证码');
      });
  }

  compareToFirstPassword(rule, value, callback) {
    const {form} = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次密码不相同！');
    } else {
      callback();
    }
  }

  setCaptchaRef(element) {
    this.captcha = element;
  }

  refreshCaptcha() {
    this.captcha.refreshCaptcha();
  }

  onCooldownFinish() {
    // 倒计时结束
    this.setState({sendEmailCooldown: true});
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <Spin spinning={this.state.loading}>
        <Form style={{maxWidth: '425px'}}>
          <Form.Item
            hasFeedback={this.state.emailValid}>
            {getFieldDecorator('userEmail', {
              rules: [
                {required: true, type: 'email', message: '请输入合法邮箱!'},
                {
                  asyncValidator: this.asyncUserEmailValidator
                }
              ]
            })(
              <Input
                prefix={<Icon type="mail" style={{color: 'rgba(0,0,0,.25)', width: '50%'}}/>}
                placeholder="请输入账号要绑定的安全邮箱"
                disabled={this.state.emailValid}
                onPressEnter={this.handleSubmit}
              />
            )}
          </Form.Item>


          {/* 邮件验证码输入条，不冷却时显示 */}
          {this.state.emailValid ? null :
            (this.state.sendEmailCooldown ? null :
              <Form.Item>
                {getFieldDecorator('emailCaptcha', {
                  rules: [
                    {required: true, message: '请输入6位邮箱验证码'},
                    {
                      validator: (rule, value, callback) => {
                        if (!value) return callback(); // 空的时候交由上一条进行检验
                        for (let i of value) {
                          if (!/^\d$/.test(i)) return callback('邮箱验证码应为6位数字');
                        }
                        if (value.length < 6) return callback('邮箱验证码应为6位数字');
                        return callback();
                      }
                    },
                    {
                      asyncValidator: this.asyncEmailCaptchaValidator
                    }
                  ]
                })(
                  <Input
                    prefix={<Icon type="safety-certificate" style={{color: 'rgba(0,0,0,.25)'}}/>}
                    placeholder="请输入收到的6位邮箱验证码"
                    maxLength={6}
                    disabled={this.state.emailValid}
                    onPressEnter={(e) => e.preventDefault()}
                  />
                )}
              </Form.Item>)
          }

          {/* 4位验证码输入条和按钮，冷却时显示 */}
          {this.state.emailValid ? null :
            (!this.state.sendEmailCooldown ? null :
              <Form.Item extra="我们需要对邮箱的有效性进行验证，感谢您的配合。">
                <Row gutter={4}>
                  <Col span={12}>
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
                        placeholder="请输入4位验证码"
                        maxLength={4}
                        onPressEnter={this.sendEmailCaptcha}
                      />
                    )}
                  </Col>
                  <Col span={8}>
                    <Button onClick={this.sendEmailCaptcha} disabled={!this.state.sendEmailCooldown}>发送验证邮件</Button>
                  </Col>
                </Row>
              </Form.Item>)
          }

          {/* 验证码或倒计时 */}
          {this.state.emailValid ? null :
            <Form.Item>
              <div align="center">
                {!this.state.sendEmailCooldown ?
                  // 两分钟冷却时间
                  <Countdown title="请到邮箱查收验证码，长时间没有收到请检查垃圾箱"
                             value={this.state.cooldownTime}
                             onFinish={this.onCooldownFinish}
                             format="若要重发验证邮件，请等待s秒"/>
                  :
                  <span>
                    <b style={{'float': 'left'}}>验证码：</b>
                    <button className={'link-button'} style={{'float': 'right'}} onClick={this.refreshCaptcha}>
                      点击刷新
                    </button>
                    <Captcha ref={this.setCaptchaRef}/>
                  </span>
                }
              </div>
            </Form.Item>
          }


          {/* 邮箱验证通过后显示username password confirmPassword submit */}
          {!this.state.emailValid ? null :
            <Form.Item>
              {getFieldDecorator('username', {
                rules: [
                  {required: true, message: '请输入账户名!'},
                  // {
                  //   type: 'string',
                  //   pattern: /^\w{6,16}$/,
                  //   message: '输入账户名(6-16位长)、绑定邮箱或手机号'
                  // },
                  {
                    asyncValidator: this.asyncUsernameValidator
                  }
                ]
              })(
                <Input
                  prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                  placeholder="请输入账户名"
                  onPressEnter={this.handleSubmit}
                />
              )}
            </Form.Item>
          }

          {!this.state.emailValid ? null :
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [
                  {required: true, message: '请输入密码'},
                  {min: 6, max: 16, message: '密码长度应为6~16(含)'},
                  {type: 'string', pattern: /\d+/, message: '密码应至少包含一位数字'},
                  {type: 'string', pattern: /[a-zA-Z]+/, message: '密码应至少包含一位大小写英文'},
                  {type: 'string', pattern: /^\w+$/, message: '密码应为英文、数字等非制表符混合串'}
                ]
              })(
                <Input.Password
                  prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                  type="password"
                  placeholder="请输入密码"
                  onPressEnter={this.handleSubmit}
                />
              )}
            </Form.Item>
          }

          {!this.state.emailValid ? null :
            <Form.Item>
              {getFieldDecorator('confirmPassword', {
                rules: [
                  {required: true, message: '请确认密码'},
                  {
                    validator: this.compareToFirstPassword
                  }
                ]
              })(
                <Input.Password
                  prefix={<Icon type="retweet" style={{color: 'rgba(0,0,0,.25)'}}/>}
                  type="password"
                  placeholder="请确认密码"
                  onPressEnter={this.handleSubmit}
                />
              )}
            </Form.Item>
          }

          {!this.state.emailValid ? null :
            <Form.Item>
              {getFieldDecorator('agreement', {
                valuePropName: 'checked',
                initialValue: false,
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if(value) return callback();
                      else return callback('需要同意用户协议');
                    }
                  }
                ]
              })(<Checkbox>同意用户协议</Checkbox>)}

              <a href="https://github.com/WhiteRobe/hypethron/blob/master/LICENSE" style={{'float': 'right'}}
                 target="_blank" rel="noopener noreferrer">
                阅读用户协议
              </a>

              <Button type="primary" style={{'width': '100%'}} onClick={this.handleSubmit}>
                完&nbsp;成&nbsp;注&nbsp;册
              </Button>

            </Form.Item>
          }

          <Form.Item>
            或者 <Link to="/pages/login">已有账号即刻登录!</Link>
          </Form.Item>

        </Form>
      </Spin>
    );
  }
}

// const WrappedRegisterFormComponent = Form.create({name: 'normal_register_form'})(RegisterFormComponent);

export default RegisterFormComponent;