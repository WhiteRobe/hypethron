import React from 'react';
import ReactDOM from 'react-dom';
import Captcha from '../../../components/util/Captcha.js';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Captcha />, div);
  ReactDOM.unmountComponentAtNode(div);
});