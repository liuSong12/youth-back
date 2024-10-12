const sqlPool = require("../mySqlConfig.js")
const UserService = require("../client_service/UserService.js")
let {Success,Error} = require('../utils/Result.js')
const UserController = {
	login: async (req, res, next)=> {
		const {code} = req.body
		try{
			let result = await UserService.login(code,res)
			res.send(Success(result));
		}catch(e){
			res.send(Error())
		}
	},
	orders:async (req,res)=>{
		const {identity} = req.userInfo
		if(identity==1){
			try{
				const result = await UserService.orders()
				res.send(Success({
					userInfo:req.userInfo,
					result
				}));
			}catch(e){
				res.send(Error())
			}
		}else{
			res.send(Success({
				userInfo:req.userInfo
			}));
		}
	},
	init:async (req,res)=>{
	    try {
	        console.log(req.userInfo)
	        res.send(Success(req.userInfo));
	    } catch (e) {
	        res.send(Error());
	    }
	},
	getNotice:async(req,res)=>{
		try{
		    
			let arr = await UserService.getNotice()
			res.send(Success(arr))
		}catch(e){
		    res.send(Error())
		}
	},
	takeOrder:async(req,res)=>{
		const {orderId} = req.body
		const {id} = req.userInfo
		try{
			let sqlRes = await UserService.takeOrder(orderId,id)
			if(sqlRes==-1){
				res.send(Success(-1))
			}else{
				res.send(Success())
			}
		}catch(e){
			res.send(Error())
		}
	},
	toBeWorker:async(req,res)=>{
		const {wokerName,workerPhone} = req.body
		const studentImg = req.file.filename
		const {id:userId}= req.userInfo
		try{
			await UserService.toBeWorker({wokerName,workerPhone,studentImg,userId})
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	checkInfo:async(req,res)=>{
		const {id:userId}= req.userInfo
		try{
			let sqlRes = await UserService.checkInfo(userId)
			res.send(Success(sqlRes))
		}catch(e){
			res.send(Error())
		}
	},
	checkUserInfo:async(req,res)=>{
		const {id:userId} = req.userInfo
		try{
			let sqlRes = await UserService.checkUserInfo(userId)
			res.send(Success(sqlRes))
		}catch(e){
			res.send(Error())
		}
	},
	getOpenid:async(req,res)=>{
		let {id:userId} = req.userInfo
		try{
		    console.log(222222)
			await UserService.getOpenid(req.body.code,userId)
			res.send(Success())
		}catch(e){
		    console.log("openidError:",e)
			res.send(Error())
		}
		
	},
	addOrder:async(req,res)=>{
		let {id:userId} = req.userInfo
		const {orderId} = req.query
		try{
			await UserService.addOrder(userId,orderId)
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	updateavatar:async(req,res)=>{
		try{
			const fileName = req.file.filename
			if(fileName==""){
				res.send(Error())
			}else{
				let {id:userId} = req.userInfo
				await sqlPool.query("UPDATE `user` SET `avatar`=? WHERE id=?",[fileName,userId])
				res.send(Success())
			}
		}catch(e){
			res.send(Error())
		}
	},
	updatename:async(req,res)=>{
		try{
			let {value} = req.query
			let {id:userId} = req.userInfo
			await sqlPool.query("UPDATE `user` SET `nikeName`=? WHERE id=?",[value,userId])
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	}
}

module.exports = UserController