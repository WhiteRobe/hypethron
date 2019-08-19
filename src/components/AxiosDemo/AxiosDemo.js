import axios from 'axios';
import React from 'react';

import { Button, Card  } from 'antd';
import 'antd/es/button/style/index.css';
import 'antd/es/card/style/index.css';

class AxiosDemo extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      getResult: null,
      postResult: null
    };

    this.sendGET = this.sendGET.bind(this);
    this.sendPOST = this.sendPOST.bind(this);
  }

  sendGET(){
    let that = this;
    axios
      .get("/api/apiExample", {
        params: {
          msg: "你发送的GET数据"
        }
      }).then((res) => {

      that.setState({
        getResult: JSON.stringify(res.data)
      });
    }).catch((err) => {
      console.error("get err", err.response.status);
      console.error(err);
    });
  }

  sendPOST(){
    let that = this;
    axios
      .post("/api/apiExample", {
        msg: "你发送的POST数据"
      }).then((res) => {

      that.setState({
        postResult: JSON.stringify(res.data)
      });
    }).catch((err) => {
      console.error("post err", err.response.status);
      console.error(err);
    });
  }

  render() {

    return (
      <div>
        <h1>Axios AJAX 测试!</h1>

        <hr/>

        <Button type="primary" shape="round" icon="ant-cloud" size="large" onClick={this.sendGET}>
          发送GET
        </Button>
        <br/>{this.state.getResult && <Card>GET的结果:{this.state.getResult}</Card>}<br/>

        <hr/>

        <Button type="primary" shape="round" icon="ant-cloud" size="large" onClick={this.sendPOST}>
          发送POST
        </Button>
        <br/>{this.state.postResult && <Card>POST的结果:{this.state.postResult}</Card>}<br/>
      </div>
    );
  }
}

export default AxiosDemo;