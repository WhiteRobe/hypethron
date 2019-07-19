import {createStore} from 'redux';

import reducer from './HypethronReducer.js';

import {addToken, removeToken} from "./ActionCreateFunction.js";

// 1. 创建状态仓库
const store = createStore(reducer);


// 2. 获取监听器和注销器
const unsubscribe = store.subscribe(() => {
    console.log("监听到数据变化：", store.getState()); // 每次更新获取新的数据
  }
);


export {
  store,
  unsubscribe
};

