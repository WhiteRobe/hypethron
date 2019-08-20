import {
  MODIFY_DEMO_VALUE,
  SET_TOKEN,
  REMOVE_TOKEN
} from './ActionTypes.js';

/**
 * 在这里注册动作产生函数
 */

export function modifyDemoValue(value) {
  return{
    type: MODIFY_DEMO_VALUE,
    value
  }
}

export function setToken(token) {
  return{
    type: SET_TOKEN,
    token
  }
}

export function removeToken() {
  return{
    type: REMOVE_TOKEN
  }
}