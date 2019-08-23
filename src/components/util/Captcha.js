import React from 'react';

/**
 * @params <opt>captchaLength: $Int
 * @params <opt>type: $String ['text', 'math'] 'text'<default>
 * @params <opt>width: $String
 * @params <opt>height: $String
 * @params <opt>board: $String
 *
 * @expose refreshCaptcha: $function 刷新验证码
 *
 * @example:
 *  @define <Captcha ref={this.setCaptchaRef} /> // remember to do: this.setCaptchaRef = this.setCaptchaRef.bind(this);
 *  @bind setCaptchaRef: (element) => {this.captcha = element}
 *  @call this.captcha.refreshCaptcha();
 */
class Captcha extends React.Component {
  constructor(props) {
    super(props);

    let captchaLength = this.props.captchaLength || 4;
    let type = this.props.type || 'text';

    this.state = {
      captchaSeed: Captcha.parseUrl(Math.random(), captchaLength, type),
      captchaLength,
      type
    };

    this.refreshCaptcha = this.refreshCaptcha.bind(this);
  }

  static parseUrl(seed, captchaLength, type){
    let url = `/papi/captcha`;
    return `${url}?seed=${seed}&captchaLength=${captchaLength}&type=${type}`;
  }

  refreshCaptcha() {
    let captchaLength = this.state.captchaLength;
    let type = this.state.type;
    this.setState({
      captchaSeed: Captcha.parseUrl(Math.random(), captchaLength, type)
    });
  }

  render() {
    return (
      <img src={this.state.captchaSeed}
           onClick={this.refreshCaptcha}
           alt="captcha"
           style={
             {
               border: this.props.border || '1px solid silver',
               width: this.props.width || '150px',
               height: this.props.height || '50px',
             }
           }
      />
    );
  }
}


export default Captcha;