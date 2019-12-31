/**
 方法命名应该为 $HTTP-METHOD_FUNCTION-NAME, 如:GET_user
 * @param obj like: { "HTTP-METHOD_FUNCTION-NAME": $function }, see example below
 * @return {{methods: Array, services: Array}}
 */

module.exports = function (obj) {
  let result = {
    methods: [],
    services: []
  };
  for (let i in obj) {
    result.methods.push(i.split("_")[0]);
    result.services.push(obj[i]);
  }
  return result;
};

/**
 * obj example:
   async function GET_anyFunc(ctx, next) {
      // do something
      return next();
    }

   module.exports = {
      GET_anyFunc
    };
 */