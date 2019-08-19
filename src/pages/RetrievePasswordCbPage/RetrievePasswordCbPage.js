import React from 'react';
import querystring from 'querystring';
import axios from 'axios';
import {connect} from 'react-redux';
import {hmac, generateSalt} from '../../util/crypto-hash-tool.js';

import {Row, Col, Input, Spin, Form, notification, Result, Button, Icon} from 'antd';
import 'antd/es/layout/style/index.css';
import 'antd/es/input/style/index.css';
import 'antd/es/spin/style/index.css';
import 'antd/es/form/style/index.css';
import 'antd/es/notification/style/index.css';
import 'antd/es/result/style/index.css';
import 'antd/es/button/style/index.css';
import 'antd/es/icon/style/index.css';
import 'antd/es/style/index.css'; // col & row

import logo from "../HypethronIntroPage/logo.png";

class RetrievePasswordCbPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      success: false
    };
    this.toggleLoadingState = this.toggleLoadingState.bind(this);
    this.handleSubmitResult = this.handleSubmitResult.bind(this);
  }

  toggleLoadingState() {
    let state = this.state.loading;
    this.setState({
      loading: !state
    });
  }

  handleSubmitResult(form, res, err) {
    if (res) { // 提交成功
      this.setState({
        success: true
      })
    } else {
      // @See https://ant.design/components/notification-cn
      notification.warn({
        message: '操作失败',
        description: `服务器检测到了安全异常，因此服务器拒绝了本次申请，请重试或联系管理员！`,
        duration: 5
      });
      console.error(err.message, err.response.data);
    }
    this.toggleLoadingState();
  }

  render() {
    return (
      <div>
        <Spin spinning={this.state.loading}>
          <Row style={{"top": "150px"}}>
            <Col span={6}>&nbsp;</Col>
            {this.state.success ?
              <Result status="success"
                      title="密码更新成功!"
                      subTitle="您的密码已重设，请使用新密码进行登录。"
                      extra={[
                        <Button type="primary" shape="round" icon="home" href="/pages/home">返回首页</Button>
                      ]}
              /> :
              <Col span={12}>
                <p align="center">
                  <span>
                    <img src={logo} alt="logo" width="70px" height="70px"/>
                  </span><br/>

                  <span style={{"margin": "10px 0 20px 0", "display": "block"}}>
                    <b style={{"font-size": "2.0em"}}>设置新密码</b>
                  </span>

                  {/*填写表单*/}
                  <WrappedCustomForm
                    beforeSubmit={this.toggleLoadingState}
                    afterSubmit={this.handleSubmitResult}
                    location={this.props.location}
                    reduxState={this.props.reduxState}
                  />
                </p>
              </Col>
            }
            <Col span={6}>&nbsp;</Col>
          </Row>
        </Spin>
      </div>
    )
  }
}


/**
 * @function beforeSubmit(form)
 * @function afterSubmit(form, res, err)
 */
class CustomForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      retrievePWCert: querystring.decode(props.location.search.replace("?", "")).retrievePWCert
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.compareToFirstPassword = this.compareToFirstPassword.bind(this);
  }

  /**
   * 向接口发送新的密码
   */
  updatePassword() {
    let that = this;
    let salt = generateSalt(8);
    let originPw = this.props.form.getFieldValue('password');
    let returnRes, returnErr;
    this.props.beforeSubmit();
    axios
      .patch("/papi/passwordRetrieveCert", {
        password: hmac(this.props.reduxState.secretKey, originPw, {alg: 'sha256', repeat: 100}), // 慢加密
        salt: salt,
        retrievePWCert: that.state.retrievePWCert
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

  handleSubmit() {
    console.log(111);
    let that = this;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        console.warn(err);
      } else {
        that.updatePassword();
      }
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

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <div>
        <Form>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [
                {required: true, message: '请输入新密码', min: 6, max: 16},
                {min: 6, max: 16, message: '密码应为为长度在6~16(含)的'},
                {type: 'string', pattern: /\d+/, message: '密码应至少包含一位数字'},
                {type: 'string', pattern: /[a-zA-Z]+/, message: '密码应至少包含一位大小写英文'},
                {type: 'string', pattern: /^\w+$/, message: '密码应为英文、数字等非制表符混合串'}
              ]
            })(
              <Input.Password
                prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                type="password"
                style={{"width":"350px"}}
                placeholder="请输入密码"
              />
            )}
          </Form.Item>

          <Form.Item>
            {getFieldDecorator('confirmPassword', {
              rules: [
                {required: true, message: '请确认密码!'},
                {
                  validator: this.compareToFirstPassword,
                }
              ]
            })(
              <Input.Password
                prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                type="password"
                style={{"width":"350px"}}
                placeholder="请确认密码"
              />
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={this.handleSubmit} style={{"width":"200px"}}>确定</Button>
          </Form.Item>

        </Form>
      </div>
    )
  }
}

/**
 * 定义Redux状态到视图容器的映射方法
 */
const mapStateToProps = (state /*, ownProps*/) => {
  return {
    reduxState: state.keyStateManager
  }
};

/**
 * 定义将哪些Dispatch方法映射到视图容器中
 */
const mapDispatchToProps = {};

const WrappedCustomForm = Form.create({name: 'custom_form'})(CustomForm); // 必须在此定义位全局常量，否则会有坑

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RetrievePasswordCbPage);