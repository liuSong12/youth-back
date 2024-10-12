const sqlPool = require("../mySqlConfig.js")
const AddressService = {
	showAddress:async(id)=>{
		return await sqlPool.query("SELECT `id`, `phone`, `addressInfo`, `addressName` FROM `address` WHERE userId=? order by id desc",[id]).then(res=>res[0])
	},
	defalutToBeNull:async(id,addrId)=>{
		//await sqlPool.query("DELETE FROM `address` WHERE id=?",[addrId])//这里不能删，为订单表里面存的是地址id，地址没了，订单也没了
		await updateOperateTime(id,sqlPool)
		await sqlPool.query("UPDATE `address` SET `userId`=? WHERE id=?",[0,addrId])
		return await sqlPool.query("UPDATE `user` SET `defaultAddress`=?,`lastOperateTime`=now() WHERE id=?",[null,id])
	},
	removeAddr:async (addrId,id)=>{
		await updateOperateTime(id,sqlPool);
		await sqlPool.query("UPDATE `address` SET `userId`=? WHERE id=?",[0,addrId])
		// return await sqlPool.query("DELETE FROM `address` WHERE id=?",[addrId])//也不能删
	},
	updateAddr:async (id,addrId)=>{
		return await sqlPool.query("UPDATE `user` SET `defaultAddress`=?,`lastOperateTime`=now() WHERE id=?",[addrId,id]) 
	},
	addA:async (id,req)=>{
		const {nickname,phone,address} = req.body;
		await updateOperateTime(id,sqlPool);
		return await sqlPool.query("INSERT INTO `address`(`userId`, `phone`, `addressInfo`, `addressName`) VALUES (?,?,?,?)",[id,phone,address,nickname])
	}
}

async function updateOperateTime(id,sqlPool){
	return await sqlPool.query("UPDATE `user` SET `lastOperateTime`=now() WHERE id=?",[id])
}

module.exports = AddressService