const fs = require('fs');
const md = require('markdown-it')();


/**
 * 输出后端接口文档
 * @input { / }
 * @output { html/text }
 */
async function GET_apiDocument(ctx, next) {

  if(ctx.SERVER_DEBUG){
    ctx.response.type = "text/html";
    ctx.body = md.render(fs.readFileSync('./documents/sysdoc/APIdoc.md').toString());
  } else {
    ctx.body = '@SERVER_DEBUG mode off. No document can be consulted now.'
  }
  return next();
}

module.exports = {
  GET_apiDocument
};