import React from 'react';
import logo from './logo.png';
import {Link} from "react-router-dom";
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
          hypethron/院庭 是一款基于<code>React</code>和<code>Node.js</code>的信息可视化、统计和管理系统。
        </p>

        <a className="HypethronIntroPage-link" href="https://github.com/WhiteRobe/hypethron"
           target="_blank" rel="noopener noreferrer"
        >
          了解"hypethron/院庭"
        </a>

        <br/>

        <Button type="primary" shape="round" icon="home" size="large">
          <Link to="/pages/home" style={{color: 'white'}}>&nbsp;进入院庭</Link>
        </Button>
      </header>
    </div>
  );
}

export default HypethronIntroPage;
