const sqlPool = require("../mySqlConfig.js")
const axios = require("axios")
const Config = require("../appConfig.js")
var moment = require('moment')
const {refund} = require("../utils/createPayUtil.js")
const Decimal = require("decimal.js")

const OrderService = {
	myOrders:async(type,id)=>{
		//id是当前用户id
		if(type==0){
			//1：所有订单 
			let res = await sqlPool.query("SELECT p.id,p.finishImgArr,p.userId, p.weight, a.addressInfo, p.number, p.inputData, p.orderTime, p.status, p.money, p.orderImgArr FROM packageorder p inner join address a on p.addressId=a.id WHERE p.userId=? and p.status<>? order by p.id desc limit 15",[id,4]).then(res=>res[0])
			return mapImg(res)
		}else if(type==1){
			//正在派送，自己的和顾客的
			let res = await sqlPool.query("SELECT p.id,p.finishImgArr,p.userId, p.weight, a.addressInfo, p.number, p.inputData, p.orderTime, p.status, p.money, p.orderImgArr FROM packageorder p inner join address a on p.addressId=a.id WHERE p.status=? and (p.userId=? or p.wokerId=?) order by p.id desc limit 15",[1,id,id]).then(res=>res[0])
			return mapImg(res)
		}else if(type==2){
			//客户的单
			let res = await sqlPool.query("SELECT p.id,p.finishImgArr,p.userId, p.weight, a.addressInfo, p.number, p.inputData, p.orderTime, p.status, p.money, p.orderImgArr FROM packageorder p inner join address a on p.addressId=a.id WHERE p.wokerId=? order by p.id desc limit 15",[id]).then(res=>res[0])
			return mapImg(res)
		}else if(type==3){
			//暂无人接单
			let res = await sqlPool.query("SELECT p.id,p.finishImgArr,p.userId, p.weight, a.addressInfo, p.number, p.inputData, p.orderTime, p.status, p.money, p.orderImgArr FROM packageorder p inner join address a on p.addressId=a.id WHERE p.status=? and p.userId=? order by p.id desc limit 15",[0,id]).then(res=>res[0])
			return mapImg(res)
		}else{
			return null
		}
	},
	uploadImg:async (fileName,orderId,userId)=>{
		await updateTime(sqlPool,userId)
		//这里要获取img数组
		let resimgarr = await sqlPool.query("SELECT `addressId`,`finishImgArr`,`userId`,`money` FROM `packageorder` WHERE id=?",[orderId]).then(res=>res[0])
		let {finishImgArr:imgstr,userId:userId1,money,addressId} = resimgarr[0]
		let addressSQL = await sqlPool.query("SELECT `addressInfo` FROM `address` WHERE id=?",[addressId]).then(res=>res[0])
		let address = addressSQL[0].addressInfo
		let newImgStr=""
		if(imgstr){
			newImgStr = imgstr+","+fileName
		}else{
			newImgStr = fileName
		}
		return await sqlPool.query("UPDATE `packageorder` SET `status`=?,`finishImgArr`=? WHERE id=?",[2,newImgStr,orderId])
	},
	createOrder:async({weight, number,inputData,money,userId,fileName,timeStamp})=>{
		await updateTime(sqlPool,userId)
		let defaultAddress = await sqlPool.query("SELECT `defaultAddress` FROM `user` WHERE id=?",[userId]).then(res=>res[0])
		//查有没有这个订单，
		let timeStamptag = await sqlPool.query("SELECT `timeStamp`,`orderImgArr` FROM `packageorder` WHERE userId=? and timeStamp=?",[userId,timeStamp]).then(res=>res[0])
		
		if(timeStamptag.length!=0){
			//有了，做更新
			let newImgsrc = timeStamptag[0].orderImgArr + "," + fileName
			await sqlPool.query("UPDATE `packageorder` SET `orderImgArr`=? WHERE timeStamp=?",[newImgsrc,timeStamp])
		}else{
			//没有，做插入
			await sqlPool.query("INSERT INTO `packageorder`(`addressId`,`weight`, `number`, `inputData`,`status`,`money`, `orderImgArr`,`userId`,`timeStamp`) VALUES (?,?,?,?,?,?,?,?,?)",[defaultAddress[0].defaultAddress,weight,number,inputData,4,money,fileName,userId,timeStamp])
		}
	},
	createO:async({weight, number,inputData,money,userId,timeStamp})=>{
		let defaultAddress = await sqlPool.query("SELECT `defaultAddress` FROM `user` WHERE id=?",[userId]).then(res=>res[0])
		await updateTime(sqlPool,userId)
		await sqlPool.query("INSERT INTO `packageorder`(`addressId`, `weight`, `number`, `inputData`,`status`, `money`,`userId`, `timeStamp`) VALUES (?,?,?,?,?,?,?,?)",[defaultAddress[0].defaultAddress,weight,number,inputData,4,money,userId,timeStamp])
	},
	returnMoney:async(userId,orderId)=>{
		//退款
		await updateTime(sqlPool,userId)
		let order = await sqlPool.query("SELECT `money`,`timeStamp` FROM `packageorder` WHERE id=?",[orderId]).then(res=>res[0])
		console.log(order)
		let {money,timeStamp} = order[0]
		time = "lsplus"+timeStamp //原订单号
		await sqlPool.query("UPDATE `packageorder` SET `status`=? WHERE timeStamp=?",[3,timeStamp])
		await refund(time,new Decimal(money).mul(new Decimal(100)).toNumber())
	}
}

async function updateTime(sqlPool,id){
	return await sqlPool.query("UPDATE `user` SET `lastOperateTime`=now() WHERE id=?",[id])
}
function mapImg(arr){
	return arr.map(item=>{
		return {
			...item,
			orderImgArr:item.orderImgArr?item.orderImgArr.split(","):null,
			finishImgArr:item.finishImgArr?item.finishImgArr.split(","):null
		}
	})
}

module.exports = OrderService