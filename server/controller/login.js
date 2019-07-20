
const jwt = require('jsonwebtoken');
const {SERVER_PRIVATE_KEY, JWT_OPTIONS} = require('../server-configure.js');

async function GET_login(ctx, next) {
  ctx.body = jwt.sign({type: "test"}, SERVER_PRIVATE_KEY, JWT_OPTIONS);
  return next();
}

async function POST_login(ctx, next) {
  ctx.body = ctx.request.body;
  return next();
}

module.exports = {
  GET_login,
  POST_login
};