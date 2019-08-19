/**
 * 1.在这里注册全局状态
 *  - 命名: xxxState
 */

const demoState = {
  value: "default"
};


const tokenState = {
  token: null
};

const keyState = {
  secretKey: 'hypethron@github:WhiteRobe'
};

/**
 * 2. 导出你所定义的全局状态
 */
export {
  demoState,
  tokenState,
  keyState
};