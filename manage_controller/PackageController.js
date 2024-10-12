const { Success,Error } = require("../utils/Result")
const PackageService = require("../manage_service/PackageService.js")
const checkSuper =require("../utils/checkSuper.js")
const sqlPool = require("../mySqlConfig")

const PackageController = {
	getpackage:async(req,res)=>{
		const {status,page,SuperSending} = req.query
		const {id,userId,wokerName} = req.userInfo.workerInfo || {} //id是工作者id，userid是userid
		const {id:storeId,responseName} = req.userInfo.storeInfo || {}
		try{
			let sqlRes = await PackageService.getpackage({status,id,page,responseName,wokerName,SuperSending})
			res.send(Success(sqlRes))
		}catch(e){
			res.send(Error())
		}
	},
	updatePackage:async(req,res)=>{
		try{
			const {id} = req.userInfo.workerInfo || {}
			let sqlRes = await PackageService.updatePackage(req.query,id)
			if(sqlRes==-1){
				res.send(Error("手慢了",0))
			}else{
				res.send(Success())
			}
		}catch(e){
			res.send(Error())
		}
	},
	repei:async(req,res)=>{
		try{
			const {id} = req.query
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			await PackageService.repei(id)
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	getPrice:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			 let price = await sqlPool.query("SELECT `id`,`price` FROM `price` WHERE 1").then(res=>res[0])
			 let priceArr = []
			 function add(index){
			 	if(index===price.length/6) return; //长度：42
			 	let newArr = []
			 	for (var i = 0; i < 6; i++) {
			 		newArr.push({
						price:price[index*6+i].price,
						id:price[index*6+i].id
					})
			 	}
			 	priceArr.push(newArr)
			 	index++
			 	add(index)
			 }
			 add(0)
			res.send(Success(priceArr))
		}catch(e){
			res.send(Error())
		}
	},
	changeProce:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			await PackageService.changeProce(req.query)
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	}
}
module.exports = PackageController
