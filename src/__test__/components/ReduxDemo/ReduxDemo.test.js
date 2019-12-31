import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import ReduxDemo from '../../../components/ReduxDemo/ReduxDemo.js';
import {store} from "../../../redux/HypethronRedux.js";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <ReduxDemo/>
    </Provider>
    , div);
  ReactDOM.unmountComponentAtNode(div);
});
