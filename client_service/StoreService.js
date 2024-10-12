const sqlPool = require("../mySqlConfig.js")
const StoreService = {
	getStore:async(req,res)=>{
		let storeList = await sqlPool.query("SELECT s.id,s.storeName title,s.storeStatus working,s.packagePrice,s.notice FROM storelist s WHERE s.storeStatus<>2 and s.storeName is not null and s.showStatus is null").then(res=>res[0])
		for (var i = 0; i < storeList.length; i++) {
			let commondity = await sqlPool.query("SELECT c.id,c.storeId,c.commondityName name,c.commondityPrice price,c.commonditystatus iswork,c.commondityimg img FROM commondity c WHERE c.storeId=?",[storeList[i].id]).then(res=>res[0])
			storeList[i].children = commondity
		}
		return storeList
	},
	createOrder:async(userId,storeId,commondityId,address,num,timestamp)=>{
		await sqlPool.query(`INSERT INTO buyfromstore (userId,storeId,commondityId,address,status,num,timestamp) VALUES (${userId},${storeId},${commondityId},'${address}',${3},${num},${timestamp})`)
	},
	createStore:async ({storeImg,responseName,responsePhone,userId})=>{
		await sqlPool.query("UPDATE `user` SET `lastOperateTime`=now() WHERE id=?",[userId])
		let res = await sqlPool.query("SELECT `id`,`storeImgArr`,`userId` FROM `storelist` WHERE userId=?",[userId]).then(res=>res[0])
		if(res.length!==0){
			//照片字符串添加
			let newStr = res[0].storeImgArr+","+storeImg
			await sqlPool.query("UPDATE `storelist` SET `storeImgArr`=? WHERE userId=?",[newStr,userId])
		}else{
			//插入
			await sqlPool.query("INSERT INTO `storelist`(`responseName`, `responsePhone`, `storeImgArr`, `storeStatus`, `userId`) VALUES (?,?,?,?,?)",[responseName,responsePhone,storeImg,2,userId])
		}
	},
	getCommondities:async(userId,type)=>{
		//type:0我的订单,1正在派送,2已退款
		return await getType(userId,type)
	}
};
async function getType(userId,type){
	let storeRes;
	if(type==0){
		storeRes = await sqlPool.query("SELECT `timestamp` FROM `buyfromstore` WHERE userId=? and status<>? order by timestamp desc limit 17",[userId,3]).then(res=>res[0])
	}else if(type==1){
		storeRes = await sqlPool.query("SELECT `timestamp` FROM `buyfromstore` WHERE userId=? and status=? order by timestamp desc limit 17",[userId,0]).then(res=>res[0])
	}else {
		storeRes = await sqlPool.query("SELECT `timestamp` FROM `buyfromstore` WHERE userId=? and status=? order by timestamp desc limit 17",[userId,2]).then(res=>res[0])
	}
    if(storeRes.length==0) return [];
	let newArr = [...new Set(storeRes.map(item=>item.timestamp))]
	let arr = []
	for (let item of newArr) {
		let a = await sqlPool.query("SELECT c.commondityName,c.commondityPrice,c.commondityimg, s.packagePrice,s.responsePhone storePhone,s.storeImgArr,s.storeName, b.num,b.storeId,b.finishImg,b.address,b.createTime,b.status,b.timestamp FROM buyfromstore b inner join storelist s on b.storeId=s.id inner join commondity c on c.storeId=s.id and b.commondityId=c.id WHERE b.timestamp=?",[item]).then(res=>res[0])
		a.forEach(storeItem=>{
			let {commondityimg,commondityPrice,commondityName,timestamp,packagePrice,num,storeId,finishImg,address,createTime,status,storeName,storeImgArr,storePhone} = storeItem
			let index=-1;
			arr.forEach((e,i)=>{
				if(e.storeId==storeId && e.timestamp==timestamp) index = i;
			})
			if(index!==-1){
			//里面有了
			arr[index]["commondities"].push({
				num,
				commondityName,
				commondityPrice,
				commondityImg:commondityimg
			})
		}else{
			//里面没有
			finishImg = finishImg==null ? null:finishImg.split(",")
			let storeImg = storeImgArr.split(",")[0]
			arr.push({
				timestamp:item,
				storeId,
				storeName,
				storeImg,
				address,
				createTime,
				storePhone,
				packagePrice,
				status,
				finishImg,
				commondities:[{
					num,
					commondityName,
					commondityPrice,
					commondityImg:commondityimg
				}]
			})
		}
		})
		
	}
	console.log(arr,"<=============")
	return arr
}

module.exports = StoreService