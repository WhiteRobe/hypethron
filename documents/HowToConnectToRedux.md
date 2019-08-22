# 如何连接Redux

> 请参考[演示DEMO](/src/components/ReduxDemo/ReduxDemo.js)进行理解。
> 
> - [Redux 中文文档](https://www.redux.org.cn/)

## Redux仓库

我们在`/src/redux`中建立了所有仓库状态，其中：
- `HypethronState.js`: 存放了所有全局状态(State)
- `ActionCreateFunction.js`: 存放了所有状态管理动作(Action)
- `ActionTypes.js`: 存放了所有所有状态管理动作的类型(Types)
- `HypethronReducer.js`: 存放了所有的状态动作处理器(Reducer)
- `HypethronRedux.js`: 建立中央状态仓库(Store)

其依赖关系和开发流程见下：

![](/documents/pics/HowToConnectReduxPic1.jpg)

## 视图组件与数据容器组件

参考[演示DEMO](/src/components/ReduxDemo/ReduxDemo.js)，我们定义一个视图组件：
```
function H1View(props) {
  console.log(props);
  return (
    <div>
      <h1>你的UI状态值是:</h1>
      <p>{props.uiState}</p>
      <h1>你的高阶Redux状态值是:</h1>
      <p>{props.reduxState.value}</p>
    </div>
  )
}
```
它只关心内部数据的渲染方式，不处理各种状态的获取和管理。

所以我们需要使用另外一个数据容器将它包裹起来：
```
class ReduxDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uiState: "UI状态"
    };

    this.updateToken = this.updateToken.bind(this);
  }

  updateToken() {
    this.props.modifyDemoValue("新的高阶Redux状态"); // 该状态更新方法由react-redux注入
  }

  render() {
    // this.props.addToken("new"); // Do not change state on render()!
    return (
      <div>
        <Button type="primary" shape="round" icon="ant-cloud" size="large" onClick={this.updateToken}>
          更新高阶Redux状态
        </Button>
        <hr/>
        <H1View reduxState={this.props.reduxState} uiState={this.state.uiState}/>
      </div>
    );
  }
}
```

同时，由于我们已在应用路由中注入了Redux Store，在`/src/redux`目录下完成了对`demoState`的管理和定义、并交由`function modifyDemoValue(value)`动作进行管理、由`demoStateManager`向Store发布订阅，所以现在只需要按照[`react-redux`](https://react-redux.js.org/introduction/quick-start)的指引，完成Redux状态库到数据容器组件的映射即可：
```
// 映射状态
const mapStateToProps = (state /*, ownProps*/) => {
  // 数据映射方式 原始状态.demoState => Reducer.demoStateManager => 数据容器.reduxState
  return {
    reduxState: state.demoStateManager
  }
};

// 映射Action
const mapDispatchToProps = {modifyDemoValue};

// 将数据容器组件与中央仓库进行连接
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReduxDemo);
```

---

[返回首页](/README.md)