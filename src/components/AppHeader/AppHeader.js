import React from "react";
import axios from "axios";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import cookie from 'react-cookies'; // @See https://www.npmjs.com/package/react-cookies
import jwt from 'jsonwebtoken'; // @See https://www.npmjs.com/package/jsonwebtoken


import {Menu, Avatar, Button, Input, Dropdown, Icon, notification, Col, Row} from "antd";
import logo from '../../pages/HypethronIntroPage/logo.png';
import defaultAvatar from './defaultAvatar.jpg';

import 'antd/es/menu/style/index.css';
import 'antd/es/avatar/style/index.css';
import 'antd/es/button/style/index.css';
import 'antd/es/input/style/index.css';
import 'antd/es/dropdown/style/index.css';
import 'antd/es/icon/style/index.css';
import 'antd/es/notification/style/index.css';

import 'antd/es/style/index.css' // col & row
import 'antd/es/grid/style/index.css' // col & row

import {setToken} from "../../redux/ActionCreateFunction";

const {Search} = Input;

class AppHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userAvatarUrl: defaultAvatar, // 用户头像
      uid: 0 // 用户uid
    };

    this.readAuthorizationTokenFromCookie(); // 尝试从cookie中读取登录状态
    setTimeout(() => this.pullUserAvatarUrl(), 1500); // 需要一定时间更新

    this.onBarSearch = this.onBarSearch.bind(this);
    this.useDefaultAvatar = this.useDefaultAvatar.bind(this);
    this.onMenuClick = this.onMenuClick.bind(this);
  }

  onBarSearch(value){ // 菜单栏搜索
    console.log(value);
  }

  readAuthorizationTokenFromCookie() {
    if (!!this.props.reduxState.token) {
      return; // 如果存在Token就免去此操作
    }
    let token = cookie.load('Authorization');
    if (!!token) {
      this.props.setToken(token);
      this.setState({
        uid: jwt.decode(token).uid
      })
    }
  }

  pullUserAvatarUrl() {
    let that = this;
    if (!!this.props.reduxState.token) { // 如果存在token，则拉取用户的头像
      let uid = this.state.uid;
      axios
        .get(`/papi/userProfiles/${uid}`, {
          headers: {
            Authorization: `Bearer ${that.props.reduxState.token}`
          }
        })
        .then(res => {
          that.setState({
            userAvatarUrl: res.data.result.length > 0 ? res.data.result[0].avatar_pic : defaultAvatar
          });
        })
        .catch(err => {
          console.error(err.message, err.response.data);
          if (err.status === 409) {
            // Token 失效 - 清除token和cookie
            that.props.setToken(null);
            cookie.remove('Authorization', {path: '/'});
            notification.info({
              message: '请重新登录',
              description: '您的登录已过期，即将跳转到登陆页面，请您重新登陆。'
            });
            setTimeout(() => that.props.history.push('/pages/login'), 1500);
          }
        });
    }
  }

  useDefaultAvatar() {
    this.setState({
      userAvatarUrl: defaultAvatar
    });
    return true;
  }

  onMenuClick(e) {
    switch (e.key) {
      case 'profile': // 这里强行绑定了这两个值
      case 'message':
        this.props.history.push(`/pages/${e.key}/${this.state.uid}`);
        break;
      case 'logout':
        this.props.setToken(null);
        cookie.remove('Authorization', {path: '/'});
        notification.success({
          message: '操作成功',
          description: '您已成功退出登录。',
          duration: 3
        });
        break;
      default:
        console.warn(`Wrong call:onMenuClick() ${e.key}`);
        break;
    }
  }

  render() {
    const menu = (
      <Menu onClick={this.onMenuClick}>
        <Menu.Item key="profile">
          <Icon type="profile"/>
          我的资料
        </Menu.Item>
        <Menu.Item key="message">
          <Icon type="message"/>
          我的消息
        </Menu.Item>
        <Menu.Item key="logout">
          <Icon type="logout"/>
          退出登录
        </Menu.Item>
      </Menu>
    );
    return (
      <Row>
        <Col span={14}>
          <Avatar src={logo} alt="logo" style={{float: 'left', margin: `16px 24px 16px 0`}}/>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            style={{lineHeight: '64px', width: '50%'}}
          >
            <Menu.Item key="home"><Link to="/pages/home">主页</Link></Menu.Item>
            <Menu.Item key="template"><Link to="/pages/template">模板</Link></Menu.Item>
            <Menu.Item key="discuss"><Link to="/pages/discuss">讨论</Link></Menu.Item>
            <Menu.Item key="cmd"><Link to="/pages/cmd">控制台</Link></Menu.Item>
          </Menu>
        </Col>

        <Col span={10}>
          <Row>
            <Col span={14} style={{textAlign: 'right'}}>
              <Search placeholder="查询 数据/讨论/用户"
                      enterButton
                      style={{margin: `16px 5px 16px 0`}}
                      onPressEnter={(e) => this.onBarSearch(e.target.value)}
                      onSearch={this.onBarSearch}
              />
            </Col>
            <Col span={10}>
              {!!this.props.reduxState.token ?
                <Row style={{textAlign: 'right'}}>
                  <Col span={16}>
                    <Dropdown overlay={menu}>
                      {/*下拉菜单*/}
                      <Icon type="plus" style={{fontSize: '20px', color: "white"}}/>
                    </Dropdown>
                  </Col>
                  <Col span={8}>
                    <Link to={`/pages/profile/${this.state.uid}`}>
                      <Avatar src={this.state.userAvatarUrl} alt="logo"
                              style={{float: 'right', margin: `16px 12px 16px 0`}}
                              onError={this.useDefaultAvatar}
                      />
                    </Link>
                  </Col>
                </Row>
                :
                <Button type="primary" style={{float: 'right', margin: `16px 12px 16px 0`}}>
                  <Link to="/pages/login">登录/注册</Link>
                </Button>
              }
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}


/**
 * 定义Redux状态到视图容器的映射方法
 */
const mapStateToProps = (state /*, ownProps*/
) => {
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
)(AppHeader);