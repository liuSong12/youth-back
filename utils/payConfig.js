const fs = require("fs")
const path = require("path")
const WxPay = require('wechatpay-node-v3');
const Config = require("../appConfig.js")
const publick_key = fs.readFileSync(path.join(__dirname,"../keys/apiclient_cert.pem"))
const private_key = fs.readFileSync(path.join(__dirname,"../keys/apiclient_key.pem"))

const pay = new WxPay({
  appid: Config.APP_ID,
  mchid: Config.MCHID,
  key: Config.KEY,
  publicKey: publick_key, // 公钥
  privateKey: private_key, // 秘钥
});

module.exports = pay