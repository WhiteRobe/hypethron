import React from 'react';
import ReactDOM from 'react-dom';
import HypethronRouter from '../../router/HypethronRouter';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<HypethronRouter />, div);
  ReactDOM.unmountComponentAtNode(div);
});
