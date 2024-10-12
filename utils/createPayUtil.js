const Config = require("../appConfig.js")
const sqlPool = require("../mySqlConfig.js");
const pay = require("./payConfig.js")

async function payfun(openid,money,time,flag){
	//flag:0:下单代拿，1：下单零食,决定通知接口:notify_url
	//下单,返回prepay_id
	money = Number(money)
	let notify_url = "";
	let description = "";
	switch (flag){
		case 0:
			notify_url = Config.NOTIFY_URL_PACKAGE
			description = "包裹下单通知"
			break;
		case 1:
			notify_url = Config.NOTIFY_URL_STORE
			description = "零食下单通知"
			break;
		case 2:
			notify_url = Config.NOTIFY_URL_TOPUP
			description = "管理员充值通知"
			break;
		default:
			return;
	}
	const params = {
		description,
		out_trade_no: "lsplus"+ time,
		notify_url,
		amount: {
		  total: money//money
		},
		payer: {
		  openid: openid
		},
		settle_info:{
			profit_sharing:flag==2?true:false
		}
	};
	return await pay.transactions_jsapi(params);
}

async function refund(out_trade_no,money,allMoney){
	//退款
	let params = {
		out_trade_no,//原订单号
		out_refund_no: "lsplus" + Date.now(),//自己生成退款单号,
		notify_url:Config.NOTIFY_URL_REFUND,
		amount:{
			refund: Number(money),
			total:allMoney?Number(allMoney):Number(money),
			currency: 'CNY'
		}
	}
	return await pay.refunds(params);
}

async function create_profitsharing_orders(openid,transaction_id,money){
	//添加分账接受方
	let params_add = {
		appid:Config.APP_ID,
		type:"PERSONAL_OPENID",
		account:openid,
		relation_type:"USER",
	}
	await pay.profitsharing_receivers_add(params_add)
	
	//开始分账
	let params = {
		appid:Config.APP_ID,
		transaction_id,
		out_order_no:"lsplus"+Date.now(),
		receivers:[
			{
				type:"PERSONAL_OPENID",
				account:openid,
				amount:money,
				description:"分账结算"
			}
		],
		unfreeze_unsplit:false//结束之后要设置:true:结算完毕，false：接着分
	}
	return await pay.create_profitsharing_orders(params)
}

async function profitsharing_orders_unfreeze(out_order_no,transaction_id){
	//解冻剩余资金
	console.log("transaction_id:",transaction_id)
	let param = {
		transaction_id,
		out_order_no,
		description:"解冻剩余资金"
	}
	return await pay.profitsharing_orders_unfreeze(param)
}

async function query_profitsharing_amounts(transaction_id){
	//查询剩余可分配资金
	return await pay.query_profitsharing_amounts(transaction_id)
}

exports.payfun = payfun
exports.refund = refund
exports.create_profitsharing_orders = create_profitsharing_orders
exports.query_profitsharing_amounts = query_profitsharing_amounts
exports.profitsharing_orders_unfreeze = profitsharing_orders_unfreeze
