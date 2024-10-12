const sqlPool = require("../mySqlConfig.js")
const {finishOrder} = require("../utils/OrderNotice.js")
const checkSuper =require("../utils/checkSuper.js")

const PackageService = {
	getpackage:async({status,id,page,responseName,wokerName,SuperSending})=>{
		//status：0：无人接单 1:正在派送，3：已退款，“underfind”：所有订单，10:超级管理员
		let num = page * 15
		if(status==1&&SuperSending!="undefined"){
			if(checkSuper(responseName,wokerName)){
				let res = await sqlPool.query("SELECT u.phone,a.phone addressphone, a.addressName, a.addressInfo address, p.id,p.wokerId,p.weight,p.number,p.inputData,p.orderTime,p.status,p.money,p.orderImgArr,p.finishImgArr,p.userId,p.timeStamp FROM packageorder p inner join address a on a.id=p.addressId inner join user u on u.id=p.userId WHERE status=1 order by orderTime desc limit ?,15",[num]).then(res=>res[0])
				return res
			}else{
				return []
			}
		}
		if(status=="undefined"){
			let res = await sqlPool.query("SELECT u.phone, a.phone addressphone, a.addressName, a.addressInfo address,p.id,p.weight,p.number,p.inputData,p.orderTime,p.status,p.money,p.orderImgArr,p.finishImgArr,p.userId,p.timeStamp FROM packageorder p inner join address a on a.id=p.addressId inner join user u on u.id=p.userId WHERE wokerId=? and status<>4 order by orderTime desc limit ?,15",[id,num]).then(res=>res[0])
			return res
		}else if(status==10){
			if(checkSuper(responseName,wokerName)){
				let res = await sqlPool.query("SELECT u.phone, a.phone addressphone, a.addressName, a.addressInfo address,p.wokerId, p.id,p.addressId,p.weight,p.number,p.inputData,p.orderTime,p.status,p.money,p.orderImgArr, p.finishImgArr,p.userId,p.timeStamp FROM packageorder p inner join address a on a.id=p.addressId inner join user u on u.id=p.userId WHERE status<>4 order by orderTime desc limit ?,15",[num]).then(res=>res[0])
				return res
			}else{
				return []
			}
		}else if(status==0){
			let res = await sqlPool.query("SELECT u.phone, a.phone addressphone, a.addressName, a.addressInfo address,p.id,p.addressId,p.weight,p.number,p.inputData,p.orderTime,p.status,p.money,p.orderImgArr,p.finishImgArr,p.userId,p.timeStamp FROM packageorder p inner join address a on a.id=p.addressId inner join user u on u.id=p.userId  WHERE wokerId is null and status=? order by orderTime desc limit ?,15",[status,num]).then(res=>res[0])
			return res
		}else{
			let res = await sqlPool.query("SELECT u.phone, a.phone addressphone, a.addressName, a.addressInfo address, p.id,p.addressId,p.weight,p.number,p.inputData,p.orderTime,p.status,p.money,p.orderImgArr,p.finishImgArr,p.userId,p.timeStamp FROM packageorder p inner join address a on a.id=p.addressId inner join user u on u.id=p.userId WHERE wokerId=? and status=? order by orderTime desc limit ?,15",[id,status,num]).then(res=>res[0])
			return res
		}
	},
	updatePackage:async({status,orderId,file,userId,totalmoney,address},id)=>{
		if(file){
			//更新数据库
			await sqlPool.query("UPDATE `packageorder` SET `finishImgArr`=?, `status`=?,`wokerId`=? WHERE id=?",[file,status,id,orderId])
			
			//通知取件
			let sqlRes  = await sqlPool.query("SELECT `openid` FROM `user` WHERE id=?",[userId]).then(res=>res[0])
			openId = sqlRes[0].openid
			await finishOrder(openId,totalmoney,address)
			
			//更新接单量
			let workerInfo = await sqlPool.query("SELECT `userId` FROM `worker` WHERE id=?",[id]).then(res=>res[0])
			let WorkerSqlRes  = await sqlPool.query("SELECT `receiveNumber` FROM `user` WHERE id=?",[workerInfo[0].userId]).then(res=>res[0])
			let num = (Number(WorkerSqlRes[0].receiveNumber) + 1).toString()
			await sqlPool.query("UPDATE `user` SET `lastOperateTime`=now(),`receiveNumber`=? WHERE id=?",[num,workerInfo[0].userId])
		}else{
			//接单
			let sqlCheck = await sqlPool.query("SELECT `id` FROM `packageorder` WHERE status=0 and id=?",[orderId]).then(res=>res[0])
			if(sqlCheck.length==0){
				return -1;
			}
			await sqlPool.query("UPDATE `packageorder` SET `status`=?,`wokerId`=? WHERE id=?",[status,id,orderId])
		}
	},
	repei:async(id)=>{
		await sqlPool.query("UPDATE `packageorder` SET `status`=0,`wokerId`=? WHERE id=?",[null,id])
	},
	changeProce:async({id,price})=>{
		await sqlPool.query("UPDATE `price` SET `price`=? WHERE id=?",[price,id])
	}
}



module.exports = PackageService