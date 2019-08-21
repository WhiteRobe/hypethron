import React from 'react';
import {connect} from 'react-redux';
import {setToken} from "../../redux/ActionCreateFunction";

import {Form, Card, notification, Spin, Result, Button} from "antd";

import 'antd/es/form/style/index.css';
import 'antd/es/card/style/index.css';
import 'antd/es/notification/style/index.css';
import 'antd/es/spin/style/index.css';
import 'antd/es/result/style/index.css';
import 'antd/es/button/style/index.css';

import RegisterFormComponent from "../RegisterPage/RegisterFormComponent.js";


class RegisterPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
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
      // save cookie
      // document.cookie=`Authorization=${token}` // koa 服务器完成了这一步
      console.log(this.props.reduxState.token);
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
      <div>
        {!!this.props.reduxState.token ?
          <Result
            status="success"
            title="恭喜您已经成功注册!"
            subTitle="您可以在之后修改资料，或者直接前往首页。"
            extra={[
              <Button type="primary" key="home" icon="home" href="/pages/home">
                前往首页
              </Button>,
              <Button key="profile" icon="user" href="/pages/profile">修改个人资料</Button>
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