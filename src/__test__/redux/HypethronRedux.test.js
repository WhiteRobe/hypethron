import {store, unsubscribe} from "../../redux/HypethronRedux.js";
import {addToken, removeToken} from "../../redux/ActionCreateFunction.js";



test('Redux work test', function () {
  console.log("仓库初始状态:", store.getState());

  let testValue = "This is the Token";

  store.dispatch(addToken(testValue));
  expect(store.getState().tokenManager.token===testValue).toBeTruthy();

  store.dispatch(removeToken());
  expect(store.getState().tokenManager.token===null).toBeTruthy();

  unsubscribe();
});
