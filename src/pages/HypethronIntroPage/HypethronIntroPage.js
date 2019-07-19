import React from 'react';
import logo from './logo.png';
import './HypethronIntroPage.css';

import { Button } from 'antd';
import 'antd/es/button/style/index.css';

function HypethronIntroPage() {
  return (
    <div className="HypethronIntroPage-div">
      <header className="HypethronIntroPage-header">
        <img src={logo} className="HypethronIntroPage-logo" alt="logo"/>

        <br/>

        <p>
          hypethron/院庭 是一款基于<code>React</code>和<code>Node.js</code>的人员信息分布统计、管理系统。
        </p>

        <a className="HypethronIntroPage-link" href="https://github.com/WhiteRobe/hypethron"
           target="_blank" rel="noopener noreferrer"
        >
          了解"hypethron/院庭"
        </a>

        <br/>

        <Button type="primary" shape="round" icon="home" size="large" href="/pages/home">
          进入院庭
        </Button>
      </header>
    </div>
  );
}

export default HypethronIntroPage;
