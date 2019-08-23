import React from 'react';
import ReactDOM from 'react-dom';
import LoginPage from '../../../pages/LoginPage/LoginPage.js';
import {store} from "../../../redux/HypethronRedux";
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <LoginPage/>
      </Router>
    </Provider>, div);
  ReactDOM.unmountComponentAtNode(div);
});