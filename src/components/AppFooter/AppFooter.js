import React from "react";
import qcode from './qcode.png';

class AppFooter extends React.Component {
  // 在此注册页面级别的内容
  // 注意：除根目录外，所有React页面需要暴露在 /pages 路径下
  render() {
    return (
      <div>
        <hr/>
        <img src={qcode} alt="qcode" style={{width: '150px', height: '150px'}}/>
      </div>
    )
  }
}

export default AppFooter;