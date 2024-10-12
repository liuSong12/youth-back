const AddressService = require("../client_service/AddressService.js")
let {Success,Error} = require('../utils/Result.js')
const sqlPool = require("../mySqlConfig.js")
const Decimal = require("decimal.js")

const CenterController = {
	centerInit:async (req,res)=>{
		const {id} = req.userInfo
		try{
			let topUp = 0
			let phoneArr = await sqlPool.query("SELECT `phone` FROM `user` WHERE id=?",[id]).then(res=>res[0])
			if(phoneArr.length && phoneArr[0].phone == "15087238064") topUp = 1;
			let sqlResult = await sqlPool.query("SELECT `inputData`,`orderTime` FROM `packageorder` WHERE UNIX_TIMESTAMP(DATE_FORMAT(orderTime,'%Y-%m-%d 00:00:00')) BETWEEN UNIX_TIMESTAMP(DATE_FORMAT(NOW(),'%Y-%m-%d 00:00:00')) AND UNIX_TIMESTAMP(DATE_FORMAT(NOW(),'%Y-%m-%d 23:59:59')) AND userId=? and status<>4 order by orderTime desc",[id]).then(res=>res[0])
			let storeList = await sqlPool.query("SELECT createTime,storeId FROM `buyfromstore` WHERE UNIX_TIMESTAMP(DATE_FORMAT(createTime,'%Y-%m-%d 00:00:00')) BETWEEN UNIX_TIMESTAMP(DATE_FORMAT(NOW(),'%Y-%m-%d 00:00:00')) AND UNIX_TIMESTAMP(DATE_FORMAT(NOW(),'%Y-%m-%d 23:59:59')) AND userId=? and status<>3 GROUP BY timestamp order by createTime desc",[id]).then(res=>res[0])
			
			for (let storeObj of storeList) {
				let a = await sqlPool.query("SELECT `storeName` FROM `storelist` WHERE id=?",storeObj.storeId).then(res=>res[0])
				sqlResult.push({
					flag:true,
					inputData:a[0].storeName,
					orderTime:storeObj.createTime
				})
			}
			let conacatRes = await sqlPool.query("SELECT `caoncat` FROM `concatus` WHERE 1 order by id desc limit 1").then(res=>res[0])
			res.send(Success({
				todayOrders:sqlResult,//[{inputData,orderTime},{}]
				userInfo:{topUp,...req.userInfo},
				concat:conacatRes[0] ? conacatRes[0].caoncat : null
			}))
		}catch(e){
			res.send(Error("未知错误"))
		}
	},
	createup:async(req,res)=>{
		try{
			const {money,time} = req.query
			let sqlRes = await sqlPool.query("SELECT `totalMoney` FROM `topup` WHERE 1 order by id desc").then(res=>res[0])
			if(sqlRes[0]){
				let totalmoney = sqlRes[0].totalMoney
				let newTotalmoney = new Decimal(totalmoney).add(new Decimal(money)).toString()
				await sqlPool.query("INSERT INTO `topup`(`money`,`totalMoney`,`timestamp`) VALUES (?,?,?)",[money,newTotalmoney,time])
			}else{
				await sqlPool.query("INSERT INTO `topup`(`money`,`totalMoney`,`timestamp`) VALUES (?,?,?)",[money,money,time])
			}
			res.send(Success())
		}catch(e){
			res.send(Error())
		}
	}
}

module.exports = CenterController