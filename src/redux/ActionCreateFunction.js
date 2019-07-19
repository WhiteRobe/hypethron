import {
  ADD_TOKEN,
  REMOVE_TOKEN
} from './ActionTypes.js';

/**
 * 在这里注册动作产生函数
 */

export function addToken(token) {
  return{
    type: ADD_TOKEN,
    token
  }
}

export function removeToken() {
  return{
    type: REMOVE_TOKEN
  }
}