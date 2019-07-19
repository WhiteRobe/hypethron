import { combineReducers } from 'redux';

import {
  tokenState
} from './HypethronState.js'

import {
  ADD_TOKEN,
  REMOVE_TOKEN
} from './ActionTypes.js';

/**
 * 永远不要在 reducer 里做这些操作：
 * 1. 修改传入参数；
 * 2. 执行有副作用的操作，如 API 请求和路由跳转；
 * 3. 调用非纯函数，如 Date.now() 或 Math.random()。
 *
 * 命名 xxxManager
 */

//----------------------------------//

function tokenManager(state = tokenState, action) {
  switch (action.type) {
    case ADD_TOKEN:
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

const reducer = combineReducers({
  tokenManager
});

export default reducer;