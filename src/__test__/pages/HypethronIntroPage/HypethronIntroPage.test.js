import React from 'react';
import ReactDOM from 'react-dom';
import HypethronIntroPage from '../../../pages/HypethronIntroPage/HypethronIntroPage';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<HypethronIntroPage />, div);
  ReactDOM.unmountComponentAtNode(div);
});
