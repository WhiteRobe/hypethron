import React from 'react';
import {connect} from 'react-redux';
import {setToken} from "../../redux/ActionCreateFunction";
import cookie from 'react-cookies'; // @See https://www.npmjs.com/package/react-cookies

import {Form, Card, notification, Spin} from 'antd';

import 'antd/es/form/style/index.css';
import 'antd/es/card/style/index.css';
import 'antd/es/tabs/style/index.css'; // as tab-card
import 'antd/es/notification/style/index.css';
import 'antd/es/spin/style/index.css';

import 'antd/es/style/index.css' // col & row
import 'antd/es/grid/style/index.css' // col & row

import LoginFormComponent from './LoginFormComponent.js';

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tabKey: 'username',
      tabList: [
        {
          key: 'username',
          tab: '账号登陆'
        },
        {
          key: 'qcode',
          tab: '二维码登录'
        },
        {
          key: 'phoneMsg',
          tab: '短信登录'
        }
      ]
    };

    this.findContent = this.findContent.bind(this);
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
    if (res) { // 登录成功
      let rememberFlag = form.getFieldValue('remember');
      let token = res.data.token;
      this.props.setToken(token); // 保存token到SPA的Store中
      if(rememberFlag){
        // save cookie
        // document.cookie=`Authorization=${token}` // koa 服务器完成了这一步
      } else {
        // remove cookie
        // document.cookie = `Authorization=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        cookie.remove('Authorization', { path: '/' });
      }
      // console.log(`用户已登录:${this.props.reduxState.token}`);
      notification.info({
        message: '登录成功',
        description: `两秒后自动跳转到首页！`,
        duration: 1.5
      });
      setTimeout(() => { // 跳转到首页
        this.props.history.push("/pages/home");
      }, 2000);
    } else {
      // @See https://ant.design/components/notification-cn
      notification.warn({
        message: '登录失败',
        description: `请检查用户是否存在、密码是否正确！`,
        duration: 5
      });
      console.error(err.message, err.response.data);
      this.toggleLoadingState(); // 登陆失败时解除Spin状态(成功时会自动跳转)
    }
  }

  findContent(key) {
    switch (key) {
      case `username`:
        return (<WrappedLoginFormComponent beforeSubmit={this.toggleLoadingState}
                                           afterSubmit={this.handleSubmitResult}/>);
      case 'qcode':
        return (<div>二维码登录</div>);
      case 'phoneMsg':
        return (<div>短信登录</div>);
      default:
        return (<WrappedLoginFormComponent beforeSubmit={this.toggleLoadingState}
                                           afterSubmit={this.handleSubmitResult}/>);
    }
  }

  render() {
    return (
      <div>
        <Spin spinning={this.state.loading}>
          <Card
            style={{width: '425px'}}
            tabList={this.state.tabList}
            activeTabKey={this.state.tabKey}
            onTabChange={key => {
              this.setState({
                tabKey: key
              });
            }}
          >
            {this.findContent(this.state.tabKey)}
          </Card>
        </Spin>
      </div>
    )
  }
}

const WrappedLoginFormComponent = Form.create({name: 'normal_login_form'})(LoginFormComponent);

/**
 * 定义Redux状态到视图容器的映射方法
 */
const mapStateToProps = (state /*, ownProps*/) => {
  return {
    reduxState: state.tokenStateManager
  }
};

/**
 * 定义将哪些Dispatch方法映射到视图容器中
 */
const mapDispatchToProps = {setToken};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);