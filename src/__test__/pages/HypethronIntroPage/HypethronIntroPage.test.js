import React from 'react';
import ReactDOM from 'react-dom';
import HypethronIntroPage from '../../../pages/HypethronIntroPage/HypethronIntroPage';
import {BrowserRouter as Router} from "react-router-dom";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Router>
      <HypethronIntroPage/>
    </Router>
    , div);
  ReactDOM.unmountComponentAtNode(div);
});
