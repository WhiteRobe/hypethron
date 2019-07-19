import React from 'react';
import {connect} from 'react-redux';
import {modifyDemoValue} from "../../redux/ActionCreateFunction";

import {Button} from 'antd';
import 'antd/es/button/style/index.css';

/**
 * 视图层组件只关心内部数据渲染
 * @param props 需要进行渲染的数据
 * @return {*}
 * @constructor
 */
function H1View(props) {
  // console.log(props);
  return (
    <div>
      <h1>你的UI状态值是:</h1>
      <p>{props.uiState}</p>
      <h1>你的高阶Redux状态值是:</h1>
      <p>{props.reduxState.value}</p>
    </div>
  )
}

/**
 * 容器组件，通过react-redux.connect()与Redux关联
 */
class ReduxDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uiState: "UI状态"
    };

    this.updateReduxState = this.updateReduxState.bind(this);
  }

  updateReduxState() {
    this.props.modifyDemoValue("新的高阶Redux状态");
  }

  render() {
    // this.props.addToken("new"); // Do not change state on render()!
    return (
      <div>
        <Button type="primary" shape="round" icon="ant-cloud" size="large" onClick={this.updateReduxState}>
          更新高阶Redux状态
        </Button>
        <hr/>
        <H1View reduxState={this.props.reduxState} uiState={this.state.uiState}/>
      </div>
    );
  }
}

/**
 * 定义Redux状态到视图容器的映射方法
 */
const mapStateToProps = (state /*, ownProps*/) => {
  return {
    reduxState: state.demoStateManager
  }
};

/**
 * 定义将哪些Dispatch方法映射到视图容器中
 */
const mapDispatchToProps = {modifyDemoValue};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReduxDemo);