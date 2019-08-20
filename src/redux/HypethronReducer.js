import { combineReducers } from 'redux';

import {
  demoState,
  tokenState,
  keyState
} from './HypethronState.js'

import {
  MODIFY_DEMO_VALUE,
  SET_TOKEN,
  REMOVE_TOKEN
} from './ActionTypes.js';

/**
 * 永远不要在 reducer 里做这些操作：
 * 1. 修改传入参数；
 * 2. 执行有副作用的操作，如 API 请求和路由跳转；
 * 3. 调用非纯函数，如 Date.now() 或 Math.random()。
 *
 */

//----------------------------------//

/**
 * 1. 定义你的Reducer
 *    - 命名 xxxStateManager
 */

function demoStateManager(state = demoState, action) {
  switch (action.type) {
    case MODIFY_DEMO_VALUE:
      return Object.assign({}, state, {
        value: action.value
      });
    default:
      return state; // 确保default条件下返回状态本身！
  }
}


function tokenStateManager(state = tokenState, action) {
  switch (action.type) {
    case SET_TOKEN:
      return Object.assign({}, state, {
        token: action.token
      });
    case REMOVE_TOKEN:
      return Object.assign({}, state, {
        token: null
      });
    default:
      return state;
  }
}

function keyStateManager(state = keyState, action) {
  // 只读全局状态库
  return state;
}

//----------------------------------//

/**
 * 2. 在这里注册你的Reducer
 */
const reducer = combineReducers({
  demoStateManager,
  tokenStateManager,
  keyStateManager
});

export default reducer;