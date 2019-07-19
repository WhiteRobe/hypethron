import React from 'react';
import ReactDOM from 'react-dom';
import AxiosDemo from '../../../components/AxiosDemo/AxiosDemo.js';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AxiosDemo />, div);
  ReactDOM.unmountComponentAtNode(div);
});
