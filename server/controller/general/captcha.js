const {global, RES_MSG} = require('../../util/global.js');
const {generatorCaptcha} = require('../../util/tools.js');


/**
 * 比对验证码，获取比对结果。需要`ctx.session.captcha`。
 * @input { captcha: $String }
 * @output { success: $Boolean }
 */
async function GET_captcha(ctx, next) {
  let logger = global.logger;
  try {
    let captcha = ctx.request.query.captcha;

    // 不区分大小写
    let isMatched = ctx.session.captcha && captcha && (captcha.toUpperCase() === ctx.session.captcha.toUpperCase());

    if (isMatched) {
      ctx.session.captcha = null; // 清空数据
    }

    ctx.body = {
      success: !!isMatched
    };


  } catch (err) {
    logger.error(err);
    ctx.body = {
      success: false,
      msg: RES_MSG.FAIL,
      errorDetail: `${RES_MSG.FAIL}:比对验证码失败请重试。`
    }
  }
  return next();
}


/**
 * 新建并返回一个验证码，该验证码将被注册到`ctx.session.captcha`中；支持生成`math`表达式。
 * @input { type:$String['', 'math'] }
 * When success:
 *   @session { captcha: $String }
 *   @output { $svg }
 * Else:
 *   @output { success:$Boolean }
 */
async function POST_captcha(ctx, next) {
  let logger = global.logger;
  try {

    let captcha = generatorCaptcha(ctx.request.body.type);

    ctx.session.captcha = captcha.text; // 保存到session中

    ctx.response.type = "image/svg+xml";
    ctx.body = captcha.data;

  } catch (err) {
    logger.error(err);
    ctx.body = {
      success: false,
      msg: RES_MSG.FAIL,
      errorDetail: `${RES_MSG.FAIL}:生成验证码失败请重试。`
    }
  }
  return next();
}

module.exports = {
  GET_captcha,
  POST_captcha
};