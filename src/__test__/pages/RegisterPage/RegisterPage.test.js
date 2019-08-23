import React from 'react';
import ReactDOM from 'react-dom';
import RegisterPage from '../../../pages/RegisterPage/RegisterPage.js';
import {store} from "../../../redux/HypethronRedux";
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <RegisterPage/>
      </Router>
    </Provider>, div);
  ReactDOM.unmountComponentAtNode(div);
});