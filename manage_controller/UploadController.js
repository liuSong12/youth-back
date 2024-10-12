const { Success,Error } = require("../utils/Result")
const UploadService = require("../manage_service/UploadService.js")

const UploadController = {
	upload:async(req,res)=>{
		try{
			let filename = req.file.filename
			let {name,price,status,commondityId,superStoreId} = req.body
			let storeInfo = req.userInfo.storeInfo || {}
			let storeId = storeInfo.id
			let sqlRes;
			if(commondityId!=="undefined"){
				//更新商品
				sqlRes = await UploadService.upload(name,price,status,filename,commondityId,superStoreId)
			}else{
				//添加商品
				sqlRes =await UploadService.addCommondity(name,price,status,filename,storeId)
			}
			res.send(Success(sqlRes))
		}catch(e){
			console.log(e)
			res.send(Error())
		}	
	},
	updateStore:async(req,res)=>{
		try{
			await UploadService.updateStore(req.body)
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	},
	uploadImg:async(req,res)=>{
		let filename = req.file.filename
		res.send(Success(filename))
	},
	uploadpackageImg:async(req,res)=>{
		let filename = req.file.filename
		res.send(Success(filename))
	}
}
module.exports = UploadController
