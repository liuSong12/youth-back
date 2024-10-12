const sqlPool = require("../mySqlConfig.js")
const Decimal = require("decimal.js")
const fs = require("fs")
const path = require("path")
const { Error } = require("../utils/Result")
const {finishOrder} = require("../utils/OrderNotice.js")
const {refund} = require("../utils/createPayUtil.js")
const checkSuper =require("../utils/checkSuper.js")

const StoreService = {
	getsending:async({storeId,status,page,responseName,wokerName})=>{
	   //staus 0:sending undefind:所有订单
		let num = page * 15
		let res;
		if(status==0){
			res = await sqlPool.query("SELECT `timestamp` FROM `buyfromstore` WHERE storeId=? and status=? order by timestamp desc limit ?,15",[storeId,status,num]).then(res=>res[0])
		}else if(status==10){
			if(checkSuper(responseName,wokerName)){
				res = await sqlPool.query("SELECT `timestamp` FROM `buyfromstore` WHERE status<>3 order by timestamp desc limit ?,15",[num]).then(res=>res[0])
			}else{
				return [];
			}
		}else{
			res = await sqlPool.query("SELECT `timestamp` FROM `buyfromstore` WHERE storeId=? and status<>3 order by timestamp desc limit ?,15",[storeId,num]).then(res=>res[0])
		}
	
	
	   if(res.length==0) return [];
	   let newArr = [...new Set(res.map(item=>item.timestamp))]
	   let arr = []
	   
	   
	   if(status==10){
		   for (let timeStamp of newArr) {
			   let mystoreId = await sqlPool.query("select storeId from buyfromstore where timestamp=?",[timeStamp]).then(res=>res[0])
			   let storeIdArr = [...new Set(mystoreId.map(item=>item.storeId))]
			   for (let storecicle of storeIdArr) {
					let buycom = await sqlPool.query("SELECT u.phone, c.commondityName,c.commondityimg,c.commondityPrice,c.saleNum,b.userId,s.packagePrice,b.storeId,b.commondityId,b.address,b.createTime,b.status,b.num,b.timestamp,b.finishImg FROM buyfromstore b inner join commondity c on c.id=b.commondityId inner join user u on u.id=b.userId inner join storelist s on b.storeId=s.id WHERE b.storeId=? and b.timestamp=?",[storecicle,timeStamp]).then(res=>res[0])
					 let {userId,finishImg,address,createTime,phone,status:sqlstatus,packagePrice} = buycom[0]
					 let timelist = []
					 let totalPrice = 0
					 for (let com of buycom) {
							let {num,commondityName,commondityimg,commondityPrice,commondityId,saleNum} = com
							totalPrice = new Decimal(totalPrice).add(new Decimal(commondityPrice).mul(new Decimal(num))).toNumber()
							timelist.push({commondityName,commondityimg,commondityPrice,num,commondityId,saleNum})
					 }
					 
					arr.push({
						SuperStoreID:status==10?storecicle:undefined,
						timestamp:timeStamp,
						userId,
						finishImg,
						address,
						createTime,
						list:timelist,
						totalPrice: new Decimal(totalPrice).add(new Decimal(packagePrice)).toNumber(),
						customPhone:phone,
						status:sqlstatus
					})
			   }
		   }
	   }else{
		   for (let timeStamp of newArr) {
		   			let buycom = await sqlPool.query("SELECT u.phone, c.commondityName,c.commondityimg,c.commondityPrice,c.saleNum,b.userId,s.packagePrice,b.storeId,b.commondityId,b.address,b.createTime,b.status,b.num,b.timestamp,b.finishImg FROM buyfromstore b inner join commondity c on c.id=b.commondityId inner join user u on u.id=b.userId inner join storelist s on b.storeId=s.id WHERE b.storeId=? and b.timestamp=?",[storeId,timeStamp]).then(res=>res[0])
		   			 let {userId,finishImg,address,createTime,phone,status:sqlstatus,packagePrice} = buycom[0]
		   			 let timelist = []
		   			 let totalPrice = 0
		   			 for (let com of buycom) {
		   					let {num,commondityName,commondityimg,commondityPrice,commondityId,saleNum} = com
		   					totalPrice = new Decimal(totalPrice).add(new Decimal(commondityPrice).mul(new Decimal(num))).toNumber()
		   					timelist.push({commondityName,commondityimg,commondityPrice,num,commondityId,saleNum})
		   			 }
		   			 
		   			arr.push({
		   				SuperStoreID:status==10?storeId:undefined,
		   				timestamp:timeStamp,
		   				userId,
		   				finishImg,
		   				address,
		   				createTime,
		   				list:timelist,
		   				totalPrice: new Decimal(totalPrice).add(new Decimal(packagePrice)).toNumber(),
		   				customPhone:phone,
		   				status:sqlstatus
		   			})
		   }
	   }
	   return arr
	},
	getOrder:async({SuperStoreId,page,storeId,status,type,responseName,wokerName})=>{
		let num = page * 15
		if(type==1){
			//这里是superAdmin全部商品
			if(checkSuper(responseName,wokerName)){
				return	await sqlPool.query("SELECT `id`,`commondityName`,`storeId`,`commondityPrice`, `commonditystatus`, `commondityimg`, `saleNum` FROM `commondity` WHERE 1 order by id desc limit ?,15",[num]).then(res=>res[0])
			}
			return [];
		}else if(type==10){
			//superAdmin,且对应商家商品
			if(checkSuper(responseName,wokerName)){
				return	await sqlPool.query("SELECT `id`,`commondityName`,`storeId`,`commondityPrice`, `commonditystatus`, `commondityimg`, `saleNum` FROM `commondity` WHERE storeId=? order by id desc limit ?,15",[SuperStoreId,num]).then(res=>res[0])
			}
			return [];
		}
		if(status != "undefined"){
			return	await sqlPool.query("SELECT `id`,`commondityName`, `commondityPrice`, `commonditystatus`, `commondityimg`, `saleNum` FROM `commondity` WHERE storeId=? and commonditystatus=? order by id desc limit ?,15",[storeId,status,num]).then(res=>res[0])
		}else{
			return	await sqlPool.query("SELECT `id`,`commondityName`, `commondityPrice`, `commonditystatus`, `commondityimg`, `saleNum` FROM `commondity` WHERE storeId=? order by id desc limit ?,15",[storeId,num]).then(res=>res[0])
		}
	},
	getImg:async(url,res)=>{
		let pathUrl = path.join(__dirname,`../public/images/commondityImg/${url}`)
		let rs = fs.createReadStream(pathUrl).on("error",(e)=>{
			res.status(404).send(Error("没有该图片"))
		})
		rs.pipe(res)
	},
	setstatus:async(id,status)=>{
		await sqlPool.query("UPDATE `commondity` SET `commonditystatus`=? WHERE id=?",[status,id])
	},
	updateStatus:async({address,totalPrice,timestamp,userId,status,file},sale)=>{
		//1：送达，2：退款,
		if(status==1){
			/*{sale:saleNum:item.saleNum+item.num,
				id:item.commondityId}*/
			await setSuccess(sale,userId,timestamp,totalPrice,address)
		}else if(status==2){
			let Alltotal = await sqlPool.query("select b.num,c.commondityPrice,b.storeId from buyfromstore b inner join commondity c on b.commondityId=c.id where b.timestamp=?",[timestamp]).then(res=>res[0])
			let totalm = 0
			let storenum = [...new Set(Alltotal.map(item=>item.storeId))]
			let packagemoney = 0
			for (let store of storenum){
			    let storemoney = await sqlPool.query("SELECT `packagePrice` FROM `storelist` WHERE id=?",[store]).then(res=>res[0])
                packagemoney = new Decimal(packagemoney).add(new Decimal(storemoney[0].packagePrice)).toNumber()
			}
			for (let comitem of Alltotal) {
				totalm = new Decimal(totalm).add(new Decimal(comitem.num).mul(new Decimal(comitem.commondityPrice))).toNumber()
			}
			totalm = new Decimal(totalm).add(new Decimal(packagemoney)).mul(new Decimal("100")).toNumber()
			console.log("lsplus"+timestamp,new Decimal(totalPrice).mul(new Decimal("100")).toNumber(),totalm)
			let a = await refund("lsplus"+timestamp,new Decimal(totalPrice).mul(new Decimal("100")).toNumber(),totalm)
			console.log(a,"《====退款结果")
			for (var i = 0; i < sale.length; i++) {
				await sqlPool.query("UPDATE `buyfromstore` SET `settledstatus`=?, `status`=? WHERE timestamp=? and commondityId=?",[1,2,timestamp,sale[i].id])
			}
		}else{
			//这里上传照片
			await setSuccess(sale,userId,timestamp,totalPrice,address,file)
		}
	}
}

async function setSuccess(sale,userId,timestamp,totalPrice,address,file){
	for (let item of sale) {
		await sqlPool.query("UPDATE `commondity` SET `saleNum`=? WHERE id=?",[item.saleNum,item.id])
	}
	let openId  = await sqlPool.query("SELECT `openid` FROM `user` WHERE id=?",[userId]).then(res=>res[0])
	openId = openId[0].openid
	let originImg = await sqlPool.query("SELECT `finishImg` FROM `buyfromstore` WHERE timestamp=?",[timestamp]).then(res=>res[0])
	if(originImg[0].finishImg){
		for (let item of sale) {
			await sqlPool.query("UPDATE `buyfromstore` SET `status`=?,`finishImg`=? WHERE timestamp=? and commondityId=?",[1,originImg[0].finishImg+","+file,timestamp,item.id])
		}
	}else{
		for (let item of sale) {
			await sqlPool.query("UPDATE `buyfromstore` SET `status`=?,`finishImg`=? WHERE timestamp=? and commondityId=?",[1,file?file:null,timestamp,item.id])
		}
	}
	await finishOrder(openId,totalPrice,address)
}

module.exports = StoreService