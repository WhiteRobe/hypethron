import React from "react";


class AppHeader extends React.Component {
  // 在此注册页面级别的内容
  // 注意：除根目录外，所有React页面需要暴露在 /pages 路径下
  render() {
    return (
      <div>
        <div> 标题栏</div>
        <hr/>
      </div>
    )
  }
}

export default AppHeader;