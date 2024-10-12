const StoreService = require("../client_service/StoreService.js")
let {Success,Error} = require('../utils/Result.js')
const sqlPool = require("../mySqlConfig.js")

const StoreController = {
	getStore:async(req,res)=>{
		try{
			let storeList = await StoreService.getStore(req,res)
			res.send(Success(storeList))
		}catch(e){
			res.send(Error())
		}
	},
	createOrder:async(req,res)=>{
		const {order,price,timestamp} = req.body
		const {id:userId} = req.userInfo
		try{
			for(item of order){
				for (let subItem of item.commondityId) {
					await StoreService.createOrder(userId,item.storeId,subItem.id,item.address,subItem.num,timestamp)
				}
			}
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	createStore:async(req,res)=>{
		const storeImg = req.file.filename
		const {responseName,responsePhone} = req.body
		const {id:userId} = req.userInfo
		try{
			await StoreService.createStore({storeImg,responseName,responsePhone,userId})
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	getCommondities:async (req,res)=>{
		//?type=1
		const {id:userId} = req.userInfo
		const {type} = req.query
		try{
			let sqlRes = await StoreService.getCommondities(userId,type)
			res.send(Success(sqlRes))
		}catch(e){
		    console.log(e,"<-------")
			res.send(Error())
		}
	}
}

module.exports = StoreController