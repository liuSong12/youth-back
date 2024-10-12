const Config = require("../appConfig.js")
const axios = require("axios")
const moment = require("moment")

async function finishOrder(openId,money,address){
	const {access_token} = await axios(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${Config.APP_ID}&secret=${Config.SECRET}`).then(res=>res.data)
	let params = {
		template_id:Config.PACKAGE_TEMPLATE_ID,
		page:"pages/center/center",
		touser:openId,
		miniprogram_state:"formal",
		lang:"zh_CN",
		data:{
			"amount7": {
				"value": money,
			},
			"time2":{
				"value":moment().format("YYYY-MM-DD HH:mm:ss")//2019-2-9 16:16:16
			},
			"thing10":{
				"value":address
			},
			"thing3":{
				"value":"尽快取走哦，生活愉快"
			}
		}
	}
	try{
		await axios.post(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,params)
	}catch(e){
		console.log("模版信息失败：",e)
	}
}

async function newOrder(openId,money,address,phone){
	const {access_token} = await axios(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${Config.APP_ID}&secret=${Config.SECRET}`).then(res=>res.data)
	let params = {
		template_id:Config.NEW_PACKAGE_TEMPLATE_ID,
		page:"pages/center/center",
		touser:openId,
		miniprogram_state:"formal",
		lang:"zh_CN",
		data:{
			"amount2": {
				"value": money,
			},
			"time4":{
				"value":moment().format("YYYY.MM.DD HH:mm")//2019-2-9 16:16:16
			},
			"thing3":{
				"value":address//送货地址
			},
			"phone_number11":{
				"value":phone
			}
		}
	}
	try{
		await axios.post(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,params)
	}catch(e){
		console.log("模版信息失败：",e)
	}
}

exports.finishOrder = finishOrder
exports.newOrder = newOrder
