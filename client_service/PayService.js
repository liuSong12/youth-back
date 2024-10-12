const sqlPool = require("../mySqlConfig.js")
const axios = require("axios")
const {payfun} = require("../utils/createPayUtil.js")
const Decimal = require("decimal.js")
const SocketController = require("../client_controller/SocketController.js")
const PayService = {
	pay:async(userId,money,time,flag)=>{
		//返回prepay_id
		const Sqlopenid = await sqlPool.query("select `openid` from `user` where id=?",[userId]).then(res=>res[0])
		const openid = Sqlopenid[0].openid
		return await payfun(openid,money,time,flag)
	},
	setSeccess:async(time)=>{
		//快递支付成功
		let res = await sqlPool.query("SELECT `userId` FROM `packageorder` WHERE timeStamp=?",[time]).then(res=>res[0])
		const id = res[0].userId
		let oldNumsql = await sqlPool.query("SELECT `orderNumber` FROM `user` WHERE id=?",[id]).then(res=>res[0])
		let num = (Number(oldNumsql[0].orderNumber) + 1).toString()
		await sqlPool.query("UPDATE `user` SET `orderNumber`=? WHERE id=?",[num,id])
		await sqlPool.query("UPDATE `packageorder` SET `status`=? WHERE timeStamp=?",[0,time])
		//通知正式快递员 但是快递员只是勾选了一次，这里只能发送一次
		SocketController.newPackage()
	},
	StorePaySuecc:async(time)=>{
		//商店支付成功
		await sqlPool.query("UPDATE `buyfromstore` SET `status`=? WHERE timestamp=?",[0,time])
		let phoneArr = await sqlPool.query("SELECT b.storeId,s.responsePhone FROM buyfromstore b inner join storelist s on b.storeId=s.id WHERE b.timestamp=?",[time]).then(res=>res[0])
		//这里要想办法通知商家送货，1：短信，2：长期订阅信息
		SocketController.newStoreOrder(phoneArr[0].responsePhone,phoneArr[0].storeId)
	},
	topUpPaySuccess:async(time,transaction_id,out_trade_no)=>{
		await sqlPool.query("UPDATE `topup` SET `transaction_id`=?,`out_trade_no`=? WHERE timestamp=?",[transaction_id,out_trade_no,time])
	},
	topUpPayFail:async(time)=>{
		await sqlPool.query("DELETE FROM `topup` WHERE timestamp=?",[time])
	},
	StorePayFail:async(time)=>{
		//商店支付失败
		await sqlPool.query("DELETE FROM `buyfromstore` WHERE timestamp=?",[time])
	},
	setFail:async(time)=>{
		//快递支付失败
		await sqlPool.query("DELETE FROM `packageorder` WHERE timeStamp=?",[time])
	}
}


module.exports = PayService