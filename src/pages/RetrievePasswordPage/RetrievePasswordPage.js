import React from 'react';
import axios from 'axios';

import {Input, Spin, Form, notification, Result, Button, Icon, Row, Col} from 'antd';

import 'antd/es/input/style/index.css';
import 'antd/es/spin/style/index.css';
import 'antd/es/form/style/index.css';
import 'antd/es/notification/style/index.css';
import 'antd/es/result/style/index.css';
import 'antd/es/button/style/index.css';
import 'antd/es/icon/style/index.css';

import 'antd/es/col/style/css'; // col & row
import 'antd/es/row/style/css'; // col & row

import Captcha from '../../components/util/Captcha.js';

import logo from "../HypethronIntroPage/logo.png";

const {Search} = Input;

class RetrievePasswordPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      success: false,
      resultFeedback: ''
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
        success: true,
        resultFeedback: `密码找回验证邮件已发往<${form.getFieldValue('email')}>，请在五分钟内完成验证。`
      })
    } else {
      // @See https://ant.design/components/notification-cn
      notification.warn({
        message: '操作失败',
        description: `请核对验证码或邮箱地址，若多次失败请刷新页面重试！`,
        duration: 2
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
                      title="申请密码找回邮件发送成功!"
                      subTitle={this.state.resultFeedback}
                      extra={[
                        <Button type="primary" shape="round" icon="home" href="/pages/home">返回首页</Button>
                      ]}
              /> :
              <Col span={12}>
                <p align="center">
                  <span>
                    <img src={logo} alt="logo" width="70px" height="70px"/>
                  </span><br/>

                  <span style={{"margin": "10px 0 10px 0", "display": "block"}}>
                    <b style={{"font-size": "2.0em"}}>密码找回</b>
                  </span>
                  <span style={{"margin": "0 0 10px 0", "display": "block"}}>请输入绑定的邮箱号以找回/重置你的用户密码</span><br/>

                  {/*填写表单*/}
                  <WrappedCustomForm beforeSubmit={this.toggleLoadingState} afterSubmit={this.handleSubmitResult}/>
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
    this.props.beforeSubmit = this.props.beforeSubmit || function () {
    };
    this.props.afterSubmit = this.props.afterSubmit || function () {
    };

    this.sendEmail = this.sendEmail.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  /**
   * 调用发送邮件的接口
   */
  sendEmail() {
    let that = this;
    let returnRes, returnErr;
    this.props.beforeSubmit(that.props.form);
    axios
      .post("/papi/passwordRetrieveCert", {
        email: that.props.form.getFieldValue('email'),
        captcha: that.props.form.getFieldValue('captcha')
      })
      .then((res) => {
        returnRes = res;
      })
      .catch((err) => {
        returnErr = err;
      })
      .finally((res, err) => {
        setTimeout(() => {
          that.props.afterSubmit(that.props.form, returnRes, returnErr);
        }, 500);
        that.refreshCaptcha();
      });
  }

  handleSubmit() {
    let that = this;
    this.props.form.validateFieldsAndScroll((err/*, values*/) => {
      if (err) {
        console.error(err);
      } else {
        that.sendEmail();
      }
    });
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <Form>
        <Form.Item>
          {getFieldDecorator('captcha', {
            rules: [{required: true, len: 4, message: '请输入4位验证码!'}]
          })(
            <Input
              prefix={<Icon type="safety" style={{color: 'rgba(0,0,0,.25)'}}/>}
              placeholder="请输入4位长的验证码"
              size="large"
              maxlength="4"
              style={{"width": "200px", "margin": "5px 20px 0 0"}}/>
          )}
          <Captcha/>
        </Form.Item>

        <Form.Item>
          {getFieldDecorator('email', {
            rules: [{required: true, type: 'email', message: '请输入合法邮箱!'}]
          })(
            <Search
              prefix={<Icon type="mail" style={{color: 'rgba(0,0,0,.25)'}}/>}
              placeholder="请输入账号所绑定的邮箱"
              enterButton="发送邮件"
              size="large"
              style={{"width": "370px"}}
              onSearch={this.handleSubmit}
              onPressEnter={this.handleSubmit}/>
          )}
        </Form.Item>

      </Form>
    )
  }
}

const WrappedCustomForm = Form.create({name: 'custom_form'})(CustomForm); // 必须在此定义位全局常量，否则会有坑


export default RetrievePasswordPage;