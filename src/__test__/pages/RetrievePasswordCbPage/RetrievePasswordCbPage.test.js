import React from 'react';
import ReactDOM from 'react-dom';
import RetrievePasswordCbPage from '../../../pages/RetrievePasswordCbPage/RetrievePasswordCbPage.js';
import {store} from "../../../redux/HypethronRedux";
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <RetrievePasswordCbPage />
      </Router>
    </Provider>, div);
  ReactDOM.unmountComponentAtNode(div);
});