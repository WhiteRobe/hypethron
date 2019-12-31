import React from 'react';
import {connect} from 'react-redux';

class ProfilePage extends React.Component{
  constructor(props){
    super(props);
    this.state ={

    }
  }

  render() {
    return (<div>个人资料页</div>)
  }
}

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
const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfilePage);