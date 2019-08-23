import React from 'react';
import {Row, Col} from 'antd';

import 'antd/es/style/index.css' // col & row
import 'antd/es/grid/style/index.css' // col & row

class QcodeLoginFormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <Row style={{minHeight: '473.5px'}}>
        <Col span={5}>&nbsp;</Col>
        <Col span={14} style={{textAlign: 'center'}}>
          二维码登录暂未制作
        </Col>
        <Col span={5}>&nbsp;</Col>
      </Row>
    )
  }
}

export default QcodeLoginFormComponent;