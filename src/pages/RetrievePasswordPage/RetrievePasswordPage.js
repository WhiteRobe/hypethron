import React from 'react';
import {Layout, Row, Col, Input} from 'antd';
import 'antd/es/layout/style/index.css';
import 'antd/es/row/style/css';
import 'antd/es/col/style/css';
import 'antd/es/input/style/index.css';
import logo from "../HypethronIntroPage/logo.png";

const {Search} = Input;

class RetrievePasswordPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      captchaSeed: '/papi/captcha?seed=0',
      captcha:''
    };

    this.refreshCaptcha = this.refreshCaptcha.bind(this);
    this.changeCaptcha = this.changeCaptcha.bind(this);
  }


  refreshCaptcha() {
    let url = '/papi/captcha?seed=';
    this.setState({
      captchaSeed: url + Math.random()
    });
  }

  changeCaptcha(event){
    console.log(event.target.value);
    this.setState({
      captcha: event.target.value
    });
  }

  render() {
    return (
      <div>
        <Row style={{"top": "300px"}}>
          <Col span={6}>&nbsp;</Col>
          <Col span={12}>
            <p align="center">
              <img src={logo} alt="logo" width="50px" height="50px"/><br/>
              <b style={{"font-size": "2.0em", "margin": "100px 0 50px 0"}}>密码找回</b><br/>
              <span>请输入绑定的邮箱号以找回/重置你的用户密码</span><br/>
              <Input placeholder="请输入验证码"
                     size="large"
                     style={{"width": "200px", "margin": " 0 20px 20px 0"}}
                     value={this.state.captcha}
                     onChange={this.changeCaptcha}/>
              <img src={this.state.captchaSeed} onClick={this.refreshCaptcha} alt="captcha"/>
              <br/>
              <Search
                placeholder="请输入邮箱"
                enterButton="发送邮件"
                size="large"
                onSearch={value => console.log(value)}/>
            </p>

          </Col>
          <Col span={6}>&nbsp;</Col>
        </Row>
      </div>
    )
  }
}


export default RetrievePasswordPage;