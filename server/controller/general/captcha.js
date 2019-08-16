const {generatorCaptcha} = require('../../util/tools.js');


/**
 * 比对验证码，获取比对结果。比对成功将清除所记录的captcha。
 * @need-session { captcha: $String }
 * @input { captcha: $String }
 * @output { success: $Boolean }
 */
async function GET_captcha(ctx, next) {

  let captcha = ctx.request.query.captcha;
  let captchaServer = ctx.session.captcha;

  ctx.assert(captcha, 400, '@params:captcha is required.');
  ctx.assert(captchaServer, 400, '@session:captcha is undefined. Consider to regenerate it.');

  // 不区分大小写
  let isMatched = captcha.toUpperCase() === captchaServer.toUpperCase();

  if (isMatched) {
    ctx.session.captcha = null; // 清空数据
  }

  ctx.body = {
    success: !!isMatched
  };

  return next();
}


/**
 * 新建并返回一个验证码，该验证码将被注册到`ctx.session.captcha`中；支持生成`math`表达式。
 * @input { type:$String['', 'math'] }
 * @session { captcha: $String }
 * @output { $svg }
 */
async function POST_captcha(ctx, next) {

  try {

    let captcha = generatorCaptcha(ctx.request.body.type);

    ctx.session.captcha = captcha.text; // 保存到session中

    ctx.response.type = "image/svg+xml";

    ctx.body = captcha.data;

  } catch (err) {
    ctx.throw(409, err.message);
  }

  return next();
}

module.exports = {
  GET_captcha,
  POST_captcha
};