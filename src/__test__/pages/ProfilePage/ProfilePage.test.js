import React from 'react';
import ReactDOM from 'react-dom';
import ProfilePage from '../../../pages/ProfilePage/ProfilePage.js';
import {store} from "../../../redux/HypethronRedux";
import {Provider} from "react-redux";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <ProfilePage/>
    </Provider>, div);
  ReactDOM.unmountComponentAtNode(div);
});