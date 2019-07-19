import {store, unsubscribe} from "../../redux/HypethronRedux.js";
import {addToken, removeToken, modifyDemoValue} from "../../redux/ActionCreateFunction.js";



test('Redux work test', function () {
  // console.log("仓库初始状态:", store.getState());

  let testValue = "This is the Token";

  store.dispatch(modifyDemoValue(testValue));
  expect(store.getState().demoStateManager.value===testValue).toBeTruthy();

  store.dispatch(addToken(testValue));
  expect(store.getState().tokenStateManager.token===testValue).toBeTruthy();

  store.dispatch(removeToken());
  expect(store.getState().tokenStateManager.token===null).toBeTruthy();

  unsubscribe();
});
