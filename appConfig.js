const appConfig = {
	PORT:8080,
	MYSQL_CONFIG:{
		host:"127.0.0.1",
		port:3306,
		user:"server",
		password:"CwT33ShNPHiTzjEX",
		database:"server",
		connectionLimit:1
	},
	PROFIT:"0.99",//利润率==>99
	APP_ID:"wx4abe8dc499a1d35a",
	SECRET:"c6290d5a0efca274a38b8008389fe8b7",
	MCHID:"1638151366",
	KEY:"lsplusasdfghjklzxcvbnmasdfghjklz",
	NOTIFY_URL_PACKAGE:ProductEnv()?"https://lsplus.cloud/api/PackagePay":"https://bci1zx2z5t12.ngrok.xiaomiqiu123.top/api/PackagePay",//快递下单回调
	NOTIFY_URL_STORE:ProductEnv()?"https://lsplus.cloud/api/StorePay":"https://bci1zx2z5t12.ngrok.xiaomiqiu123.top/api/StorePay",//商店下单回调
	NOTIFY_URL_TOPUP:ProductEnv()?"https://lsplus.cloud/api/topUpPay":"https://bci1zx2z5t12.ngrok.xiaomiqiu123.top/api/topUpPay",//管理员充值回调
	NOTIFY_URL_REFUND:ProductEnv()?"https://lsplus.cloud/api/refund":"https://bci1zx2z5t12.ngrok.xiaomiqiu123.top/api/refund",//退款回调
	PACKAGE_TEMPLATE_ID:"Hq48nOhdGqD7cNJMBuTRF-RX2vIiZFNmjQqXxEjmhUw",//送达模版
	NEW_PACKAGE_TEMPLATE_ID:"6qeb81eWTOGmz7Ootee113Q5zSqVdy3pifBiUoRhzEE",//新的快递通知
}
function ProductEnv(){
	return process.env.NODE_ENV == "production"
}
module.exports = appConfig