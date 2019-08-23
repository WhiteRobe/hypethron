import React from "react";

import {Link} from "react-router-dom";

import {Col, Row, Card, Layout} from 'antd';
import 'antd/es/col/style/css'; // col & row
import 'antd/es/row/style/css'; // col & row
import 'antd/es/layout/style/index.css';
import 'antd/es/layout/style/index.css';
import './AppFooter.css';
import qrCode from './qcode.png';
import ghs from "./ghs.png";

const {Footer} = Layout

class AppFooter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            icp: "陕ICP备XXXXXXXX号",
            aboutUs: "https://github.com/WhiteRobe/hypethron",
            joinUs: "https://github.com/WhiteRobe/hypethron",
            disclaimer: "https://github.com/WhiteRobe/hypethron"
        }

    }

    // 在此注册页面级别的内容
    // 注意：除根目录外，所有React页面需要暴露在 /pages 路径下
    render() {
        return (

            <Footer style={{background: '#2a2f35', padding: '30px', position: "absolute", bottom: '0', width: "100%"}}>
                <Row gutter={16}>
                    <Col span={9}>
                        <Row className="AppFooterComponentLeft">
                            <Card
                                hoverable
                                style={{
                                    width: '9.375em',
                                    height: '9.375em',
                                    margin: '0 auto 10px',
                                    borderRadius: '10px'
                                }}
                                cover={<img alt="example" src={qrCode}/>}
                            >
                            </Card>
                            <p style={{lineHeight: '1.4em', paddingTop: '10rpx', clear: 'both'}}>扫一扫，加入我们，共同开发</p>

                        </Row>

                    </Col>
                    <Col span={6}>
                        <Row className="AppFooterComponentCenter">
                            <Col>
                            <a style={{color: '#61dafb', display: "inlineBlock"}}
                               href="https://github.com/WhiteRobe/hypethron"
                               target="_blank" rel="noopener noreferrer"
                            >
                                "hypethron/院庭"
                            </a>,数据可视化的必选工具</Col>
                        </Row>
                    </Col>

                    <Col span={9}>
                        <Row className="AppFooterComponentRight" gutter={16}>
                            <Col span={24} className="AppFooterComponentLink">
                                <li><a href={this.state.aboutUs}
                                       target="_blank" rel="noopener noreferrer">关于我们</a></li>
                                <li><a href={this.state.joinUs}
                                       target="_blank" rel="noopener noreferrer">加入我们</a></li>
                                <li><a href={this.state.disclaimer}
                                       target="_blank" rel="noopener noreferrer">免责声明</a></li>
                                <li><Link to="/pages/contact_cs">意见反馈</Link></li>
                            </Col>
                        </Row>
                        <Row className="AppFooterComponentRight" gutter={16}>
                            <Col span={24} className="AppFooterComponentInformation" >
                                <li>联系地址：陕西省西安市太白南路2号</li>
                                <li>联系方式：example@qq.com</li>
                                <li>{this.state.icp}</li>
                                <li><img src={ghs} alt="logo"/>陕公安备XXXXXXX号</li>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} className="appFooterComponentRight">
                        @2019 hypethron/院庭
                    </Col>
                </Row>


            </Footer>
        );
    }
}

export default AppFooter;