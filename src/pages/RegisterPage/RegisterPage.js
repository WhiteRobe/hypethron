import React from 'react';
import {connect} from 'react-redux';
import {setToken} from "../../redux/ActionCreateFunction";
import {Link} from "react-router-dom";
import jwt from 'jsonwebtoken';

import {Form, Card, notification, Spin, Result, Button, Row, Col} from "antd";

import 'antd/es/form/style/index.css';
import 'antd/es/card/style/index.css';
import 'antd/es/notification/style/index.css';
import 'antd/es/spin/style/index.css';
import 'antd/es/result/style/index.css';
import 'antd/es/button/style/index.css';

import 'antd/es/style/index.css' // col & row
import 'antd/es/grid/style/index.css' // col & row

import RegisterFormComponent from "../RegisterPage/RegisterFormComponent.js";
import RegisterBG from "../RegisterPage/RegisterBG.jpg";


class RegisterPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      userUID: 0
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
    if (res) { // 注册成功
      let token = res.data.token;
      this.props.setToken(token); // 保存token到SPA的Store中
      this.setState({
        userUID: jwt.decode(token).uid
      });
      // save cookie
      // document.cookie=`Authorization=${token}` // koa 服务器完成了这一步
      // console.log(this.props.reduxState.token);
      notification.success({
        message: '注册成功',
        description: `欢迎您的加入，祝您在本站过得愉快！`,
        duration: 2
      });
    } else {
      // @See https://ant.design/components/notification-cn
      notification.warn({
        message: '注册失败',
        description: `请稍后再试！`,
        duration: 5
      });
      console.error(err.message, err.response.data);
    }
    this.toggleLoadingState();
  }

  render() {
    return (
      <div style={{
        backgroundImage: `url(${RegisterBG})`,
        height: '100%',
        minHeight: '888px',
        maxWidth: '100%',
        padding: '40px'
      }}>
        <Row style={{padding: '150px 0px 20px 80px', opacity: '0.8'}}>
          <Col span={8}>&nbsp;</Col>
          <Col span={8}>
            {!!this.props.reduxState.token ?
              <Result
                status="success"
                title="恭喜您已经成功注册!"
                subTitle="您可以在之后修改资料，或者直接前往首页。"
                extra={[
                  <Button type="primary" key="home" icon="home">
                    <Link to="/pages/home" style={{color: 'white'}}>&nbsp;前往首页</Link>
                  </Button>,
                  <Button key="profile" icon="user">
                    <Link to={`/pages/profile/${this.state.userUID}`}
                          style={{color: 'rgba(0,0,0,.65)'}}>&nbsp;修改个人资料</Link>
                  </Button>
                ]}
              />
              :
              <Spin spinning={this.state.loading}>
                <Card title="欢迎您的加入 😊" style={{width: '425px'}}>
                  <WrappedRegisterFormComponent beforeSubmit={this.toggleLoadingState}
                                                afterSubmit={this.handleSubmitResult}/>
                </Card>
              </Spin>
            }
          </Col>
          <Col span={8}>&nbsp;</Col>
        </Row>
      </div>
    );
  }
}

const WrappedRegisterFormComponent = Form.create({name: 'normal_register_form'})(RegisterFormComponent);

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
)(RegisterPage);