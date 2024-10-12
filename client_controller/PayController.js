const PayService = require("../client_service/PayService.js")
let {Success,Error} = require('../utils/Result.js')
const sqlPool = require("../mySqlConfig.js")
const pay = require("../utils/payConfig.js")
const Config = require("../appConfig.js")

const PayController = {
	pay:async(req,res)=>{
		//下单，返回prepay_id
		const {id:userId} = req.userInfo
		const {money,time,flag} = req.body
		try{
			let sqlRes = await PayService.pay(userId,money,time,flag);
			res.send(Success(sqlRes))
		}catch(e){
			res.send(Error())
		}
	},
	PackagePay:async(req,res)=>{
		//快递支付结果回调
		let time = ""
		try{
			let {ciphertext,associated_data,nonce} = req.body.resource;
			const result = pay.decipher_gcm(ciphertext,associated_data,nonce,Config.KEY)
			const {trade_state,out_trade_no} = result
			time = out_trade_no.substring(out_trade_no.lastIndexOf("s")+1)
			if(trade_state === "SUCCESS"){
				await PayService.setSeccess(time)
				res.status(200)
				res.send({
					code:"SUCCESS",
					message:"成功"
				})
			}else{
				await PayService.setFail(time)
			}
		}catch(e){
			res.status(500)
			res.send({
				code:"FAIL",
				message:"失败"
			})
		}
	},
	StorePay:async(req,res)=>{
		//零食支付结果回调
		let time = ""
		try{
			let {ciphertext,associated_data,nonce} = req.body.resource;
			const result = pay.decipher_gcm(ciphertext,associated_data,nonce,Config.KEY)
			const {trade_state,out_trade_no} = result
			time = out_trade_no.substring(out_trade_no.lastIndexOf("s")+1)
			if(trade_state === "SUCCESS"){
				await PayService.StorePaySuecc(time)
				res.status(200)
				res.send({
					code:"SUCCESS",
					message:"成功"
				})
			}else{
				await PayService.StorePayFail(time)
			}
		}catch(e){
			res.status(500)
			res.send({
				code:"FAIL",
				message:"失败"
			})
		}
	},
	topUpPay:async(req,res)=>{
		//管理员充值回调
		let time = ""
		try{
			let {ciphertext,associated_data,nonce} = req.body.resource;
			const result = pay.decipher_gcm(ciphertext,associated_data,nonce,Config.KEY)
			const {trade_state,out_trade_no,transaction_id} = result
			time = out_trade_no.substring(out_trade_no.lastIndexOf("s")+1)
			if(trade_state === "SUCCESS"){
				await PayService.topUpPaySuccess(time,transaction_id,out_trade_no)
				res.status(200)
				res.send({
					code:"SUCCESS",
					message:"成功"
				})
			}else{
				await PayService.topUpPayFail(time)
			}
		}catch(e){
			res.status(500)
			res.send({
				code:"FAIL",
				message:"失败"
			})
		}
	},
	refund:async(req,res)=>{
		//退款结果回调
		try{
			 let {ciphertext,associated_data,nonce} = req.body.resource;
			 const result = pay.decipher_gcm(ciphertext, associated_data, nonce, Config.KEY);
			 const {refund_status,out_trade_no} = result
			  if (refund_status === 'SUCCESS') {
				 res.status(200);
				 res.send({
					 code: 'SUCCESS',
					 message: "成功",
				 });
			 }
		}catch(e){
			res.status(500);
			res.send({
				code: 'FAIL',
				message: "失败",
			});
		}
	}
}


module.exports = PayController