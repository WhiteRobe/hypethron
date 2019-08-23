import React from 'react';

import {Card, Carousel} from 'antd';

import 'antd/es/card/style/index.css' // col & row
import 'antd/es/carousel/style/index.css' // col & row

class MessageLoginFormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginIntroTitle: 'Hypethron是什么？'
    }
  }

  render() {
    return (
      <Card style={{minHeight: '577.5px', padding: '0'}}
            title={this.state.loginIntroTitle}
      >
        <div style={{background: '#364d79', minHeight: '460px'}}>
          <Carousel autoplay
                    dots
                    style={{
                      textAlign: 'center',
                      height: '160px',
                      lineHeight: '160px',
                      background: '#364d79',
                      overflow: 'hidden'
                    }}
                    draggable
                    slide={'div'}

          >
            <div>
              <h3 style={{minHeight: '460px'}}>1</h3>
            </div>
            <div>
              <h3>2</h3>
            </div>
            <div>
              <h3>3</h3>
            </div>
          </Carousel>
        </div>
      </Card>
    )
  }
}

export default MessageLoginFormComponent;