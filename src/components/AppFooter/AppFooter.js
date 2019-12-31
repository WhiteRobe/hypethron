import React from "react";
import {Link} from "react-router-dom";

import {Col, Row, Card} from 'antd';
import 'antd/es/style/index.css' // col & row
import 'antd/es/grid/style/index.css' // col & row
import 'antd/es/layout/style/index.css';
import './AppFooter.css';
import qrCode from './qcode.png';
import ghs from "./ghs.png";


class AppFooter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      address: '某某路某某号',
      contactEmail: 'example@hypethron.com',
      icpRecord: "陕ICP备XXXXXXXX号",
      domainRecord: "陕公安备XXXXXXXX号",
      aboutUs: "https://github.com/WhiteRobe/hypethron",
      joinUs: "https://github.com/WhiteRobe/hypethron",
      disclaimer: "https://github.com/WhiteRobe/hypethron"
    }

  }

  render() {
    return (
      <Row style={{background: '#2a2f35', width: "100%"}}>
        <Row gutter={16}>
          <Col span={8}>
            <div className="AppFooterComponentLeft">
              <Card
                hoverable
                style={{
                  width: '12.375em',
                  height: '12.375em',
                  margin: '20px auto',
                  borderRadius: '10px'
                }}
                cover={<img alt="qcode" src={qrCode}/>}
              >
              </Card>
              <p style={{lineHeight: '1.4em', paddingTop: '10px', clear: 'both'}}>扫一扫，加入我们，共同开发</p>
            </div>
          </Col>
          <Col span={8} className="AppFooterComponentCenter">
            <a style={{color: '#61dafb', display: "inlineBlock"}}
               href="https://github.com/WhiteRobe/hypethron"
               target="_blank" rel="noopener noreferrer"
            >
              "hypethron/院庭"
            </a>
            <div style={{fontSize: 20, marginTop: 20}}>
              一款基于React和Node.js的信息可视化、统计和管理系统。
            </div>
          </Col>

          <Col span={8} className="AppFooterComponentRight">
            <div style={{marginTop: '40px'}}>
              <span className="AppFooterComponentLink">
                <li><a href={this.state.aboutUs}
                       target="_blank" rel="noopener noreferrer">关于我们</a></li>
                <li><a href={this.state.joinUs}
                       target="_blank" rel="noopener noreferrer">加入我们</a></li>
                <li><a href={this.state.disclaimer}
                       target="_blank" rel="noopener noreferrer">免责声明</a></li>
                <li><Link to="/pages/contact_cs">意见反馈</Link></li>
              </span>

              <span className="AppFooterComponentInformation">
                <li>联系地址：{this.state.address}</li>
                <li>联系方式：{this.state.contactEmail}</li>
                <li>{this.state.icpRecord}</li>
                <li><img src={ghs} alt="logo"/>&nbsp;{this.state.domainRecord}</li>
              </span>
            </div>
          </Col>
        </Row>

        <div style={{minHeight: '40px', textAlign: 'center', color: 'white'}}>
            @2019 hypethron/院庭™ LICENSE 'MIT'
        </div>
      </Row>
    );
  }

}

export default AppFooter;