import React from 'react';
import ReactDOM from 'react-dom';
import RetrievePasswordPage from '../../../pages/RetrievePasswordPage/RetrievePasswordPage.js';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<RetrievePasswordPage />, div);
  ReactDOM.unmountComponentAtNode(div);
});