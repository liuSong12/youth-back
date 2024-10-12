const sqlPool = require("../mySqlConfig.js")
const OrderService = require("../client_service/OrderService.js")
let {Success,Error} = require('../utils/Result.js')
const OrderController = {
	myOrders:async(req,res)=>{
		const {type} = req.query
		const {id} = req.userInfo
		try{
			let sqlRes = await OrderService.myOrders(type,id)
			res.send(Success(sqlRes))
		}catch(e){
			res.send(Error())
		}
	},
	uploadImg:async(req,res)=>{
		const fileName = req.file.filename
		const orderId = req.body.orderId
		const userId = req.userInfo.id
		try{
			await OrderService.uploadImg(fileName,orderId,userId)
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	createOrder:async(req,res)=>{
		const fileName = req.file.filename
		const {id:userId} = req.userInfo
		const {weight, number, inputData,money,time} = req.body
		try{
			await OrderService.createOrder({weight, number,inputData,money,userId,fileName,timeStamp:time})
			res.send(Success());
		}catch(e){
			res.send(Error())
		}
	},
	createO:async(req,res)=>{
		const {id:userId} = req.userInfo
		const {weight, number, inputData,money,timeStamp} = req.body
		try{
			await OrderService.createO({weight, number,inputData,money,userId,timeStamp})
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	returnMoney:async(req,res)=>{
		const {id:userId} = req.userInfo
		const {orderId} = req.body
		try{
			await OrderService.returnMoney(userId,orderId)
			res.send(Success())
		}catch(e){
			console.log(e)
			res.send(Error())
		}
	}
}

module.exports = OrderController