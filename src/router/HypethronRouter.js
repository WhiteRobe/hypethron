import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {Provider} from 'react-redux';

import axiosDemo from "../components/AxiosDemo/AxiosDemo.js";
import reduxDemo from "../components/ReduxDemo/ReduxDemo.js";

// 组件
import appHeader from "../components/AppHeader/AppHeader.js";
import appFooter from "../components/AppFooter/AppFooter.js";

// 页面
import hypethronIntroPage from "../pages/HypethronIntroPage/HypethronIntroPage.js";
import homePage from "../pages/HomePage/HomePage.js";
import loginPage from "../pages/LoginPage/LoginPage.js";
import registerPage from "../pages/RegisterPage/RegisterPage.js";
import retrievePasswordCbPage from "../pages/RetrievePasswordCbPage/RetrievePasswordCbPage.js";
import retrievePasswordPage from "../pages/RetrievePasswordPage/RetrievePasswordPage.js";
import profilePage from "../pages/ProfilePage/ProfilePage.js";

import {store} from "../redux/HypethronRedux.js";

class HypethronRouter extends React.Component {
  // 在此注册页面级别的内容
  // 注意：除根目录外，所有React页面需要暴露在 /pages 路径下
  render() {
    return (
      <Provider store={store}>
        <Router>
          <Route exact path="/" component={hypethronIntroPage}/>
          {/*所有`/pages`都会带有一个标题栏，除非带有`exact`属性*/}
          <Route path="/pages" component={appHeader}/>

          <Route path="/pages/home" component={homePage}/>

          <Route path="/pages/AxiosDemo" component={axiosDemo}/>
          <Route path="/pages/ReduxDemo" component={reduxDemo}/>

          {/*登录页面*/}
          <Route path="/pages/login" component={loginPage}/>
          {/*注册页面*/}
          <Route path="/pages/register" component={registerPage}/>
          {/*找回密码页面*/}
          <Route path="/pages/retrieve_password" component={retrievePasswordPage}/>
          {/*找回密码填写新密码页面*/}
          <Route path="/pages/retrieve_password_cb" component={retrievePasswordCbPage}/>
          {/*个人资料页面*/}
          <Route path="/pages/profile/:uid" component={profilePage}/>

          {/*所有`/pages`都会带有一个底部信息栏，除非带有`exact`属性*/}
          <Route path="/pages" component={appFooter}/>
        </Router>
      </Provider>
    )
  }
}


export default HypethronRouter;