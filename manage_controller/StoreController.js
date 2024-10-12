const { Success,Error } = require("../utils/Result")
const StoreService = require("../manage_service/StoreService.js")
const sqlPool = require("../mySqlConfig")

const StoreController = {
	getsending:async(req,res)=>{
		const {status,page} = req.query
		const {id:storeId,responseName} = req.userInfo.storeInfo || {}
		const {wokerName} = req.userInfo.workerInfo || {}
		try{
			let sqlRes = await StoreService.getsending({storeId,status,page,responseName,wokerName})
			res.send(Success(sqlRes))
		}catch(e){
		    console.log("出错了：",e)
			res.send(Error())
		}
	},
	getOrder:async(req,res)=>{
		const {status,type,page,SuperStoreId} = req.query
		const {id:storeId,responseName} = req.userInfo.storeInfo || {}
		const {wokerName} = req.userInfo.workerInfo || {}
		try{
			let sqlRes = await StoreService.getOrder({SuperStoreId,page,storeId,status,type,responseName,wokerName})
			res.send(Success(sqlRes))
		}catch(e){
			res.send(Error())
		}
	},
	getImg:async(req,res)=>{
		const {url} = req.query
		try{
			let sqlRes = await StoreService.getImg(url,res)
		}catch(e){
			res.send(Error("没有该图片"))
		}
	},
	setstatus:async(req,res)=>{
		const {id,status} = req.query
		try{
			await StoreService.setstatus(id,status)
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	updateStatus:async(req,res)=>{
		try{
			await StoreService.updateStatus(req.query,req.body.sale)
			res.send(Success())
		}catch(e){
		    console.log("退款错误：",e)
			res.send(Error())
		}
	},
	deletecom:async(req,res)=>{
		try{
			const {id} = req.params
			await sqlPool.query("DELETE FROM `commondity` WHERE id=?",[id])
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	}
}
module.exports = StoreController
