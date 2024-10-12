const UserService = require("../manage_service/UserService.js")
const sqlPool = require("../mySqlConfig.js")
const checkSuper = require("../utils/checkSuper.js")
const {Success,Error} = require("../utils/Result.js")

const UserController = {
	login: async (req,res)=>{
		const {name,phone} = req.body
		try{
			let Info = await UserService.login(name,phone,res)
			if(Info){
				res.send(Success(Info))
			}else{
				res.send(Error("您还未注册快递员或商店"))
			}
		}catch(e){
			res.send(Error())
		}
	},
	getworker:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			let sqlRes = await UserService.getworker(req.query)
			res.send(Success(sqlRes))
		}catch(e){
			res.send(Error())
		}
	},
	update:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			await UserService.update(req.query)
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	getStore:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			let sqlRes = await UserService.getStore(req.query)
			res.send(Success(sqlRes))
		}catch(e){
			res.send(Error())
		}
	},
	updateStoreStatue:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			await UserService.updateStoreStatue(req.query)
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	getallUser:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			let sqlRes = await UserService.getallUser(req.query)
			res.send(Success(sqlRes))
		}catch(e){
			res.send(Error())
		}
	},
	getnotice:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			let sqlRes = await UserService.getnotice()
			res.send(Success(sqlRes))
		}catch(e){
			res.send(Error())
		}
	},
	changenotice:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			await UserService.changenotice(req.query)
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	changeSwiper:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			await UserService.changeSwiper(req.query)
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	addnotice:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			let filename = req.file && req.file.filename 
			await UserService.addnotice(req.body,filename)
			res.send(Success())
		}catch(e){
			console.log(e)
			res.send(Error())
		}
	},
	deletenotice:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			await UserService.deletenotice(req.query)
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	getconcat:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			let caoncatres = await sqlPool.query("SELECT `caoncat` FROM `concatus` WHERE 1 order by id desc limit 1").then(res=>res[0])
			res.send(Success(caoncatres[0].caoncat))
		}catch(e){
			res.send(Error())
		}
	},
	updateconcat:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			await sqlPool.query("INSERT INTO `concatus`(`caoncat`) VALUES (?)",[req.query.value])
			res.send(Success())
		}catch(e){
			console.log(e)
			res.send(Error())
		}
	},
	setStoreShow:async(req,res)=>{
	    try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			let {showStatus,id} = req.query
			await sqlPool.query("UPDATE `storelist` SET `showStatus`=? WHERE id=?",[showStatus=="1"?null:1,id])
			res.send(Success())
		}catch(e){
			console.log(e)
			res.send(Error())
		}
	}
}

module.exports = UserController