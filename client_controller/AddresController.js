const AddressService = require("../client_service/AddressService.js")
let {Success,Error} = require('../utils/Result.js')
const sqlPool = require("../mySqlConfig.js")
const AddressController = {
	showAddress:async (req,res)=>{
		const {id} = req.userInfo
		try{
			const defaultAddress = await sqlPool.query("SELECT `defaultAddress` FROM `user` WHERE id=?",[id]).then(res=>res[0][0].defaultAddress)
			let result = await AddressService.showAddress(id)
			result = result.map(item=>{
				return {
					...item,
					isdefault:item.id === defaultAddress?1:0
				}
			})
			res.send(Success(result))
		}catch(e){
			res.send(Error("未知错误"))
		}
	},
	deleteAddress:async(req,res)=>{
		const {id,defaultAddress} = req.userInfo
		try{
			if(defaultAddress==req.params.id){
				await AddressService.defalutToBeNull(id,req.params.id)
			}else{
				await AddressService.removeAddr(req.params.id,id)
			}
			res.send(Success())
		}catch(e){
			res.send(Error("未知错误"))
		}
	},
	updateAddr:async (req,res)=>{
		const {id} = req.userInfo
		try{
			await AddressService.updateAddr(id,req.params.id)
			res.send(Success())
		}catch(e){
			res.send(Error("未知错误"))
		}
	},
	addA:async (req,res)=>{
		const {id} = req.userInfo
		try{
			await AddressService.addA(id,req)
			res.send(Success())
		}catch(e){
			res.send(Error("未知错误"))
		}
	}
}

module.exports = AddressController