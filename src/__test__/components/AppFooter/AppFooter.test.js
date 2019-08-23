import React from 'react';
import ReactDOM from 'react-dom';
import AppFooter from '../../../components/AppFooter/AppFooter.js';
import {BrowserRouter as Router} from "react-router-dom";

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
        <Router>
            <AppFooter/>
        </Router>
        , div);
    ReactDOM.unmountComponentAtNode(div);
});