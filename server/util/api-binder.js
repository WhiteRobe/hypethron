


// 方法命名应该为 $HTTP-METHOD_FUNCTION-NAME
// 如, GET_user

module.exports = function (obj) {
  let result={
    methods:[],
    services:[]
  };
  for(let i in obj){
    result.methods.push(i.split("_")[0]);
    result.services.push(obj[i]);
  }
  return result;
};