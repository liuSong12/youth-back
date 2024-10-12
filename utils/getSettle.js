const Decimal = require("decimal.js")
const sqlPool = require("../mySqlConfig")
const { create_profitsharing_orders,query_profitsharing_amounts, profitsharing_orders_unfreeze } = require("./createPayUtil")
const {PROFIT} = require("../appConfig.js")
const fs = require("fs").promises
const path = require("path")
const schedule = require('node-schedule')

async function getStoreSettleMoney(){
	//单价，数量，商店id 
	let storeInfoMoney = await sqlPool.query("SELECT u.openid,b.storeId,c.commondityPrice,b.num FROM buyfromstore b inner join storelist s on b.storeId=s.id inner join commondity c on b.commondityId=c.id inner join user u on s.userId=u.id WHERE u.phone<>? and b.settledstatus is null and b.status=1",["15087238064"]).then(res=>res[0])
	let storeList = []
	storeInfoMoney.forEach(item=>{
		let index = -1
		storeList.forEach((e,i)=>{
			if(e.storeId==item.storeId) index = i;
		})
		if(index!==-1){
			//有了
			let oldTotalMoney = storeList[index].totalMoney
			storeList[index].totalMoney = new Decimal(oldTotalMoney).add(new Decimal(item.commondityPrice).mul(new Decimal(item.num))).toNumber()
		}else{
			//没有
			storeList.push({
				openid:item.openid,
				storeId:item.storeId,
				totalMoney:new Decimal(item.commondityPrice).mul(new Decimal(item.num)).toNumber()
			})
		}
	});
	
	for (let i = 0; i < storeList.length; i++) {
		let sqlres = await sqlPool.query("select packagePrice from storelist where id=?",[storeList[i].storeId]).then(res=>res[0])
		storeList[i].totalMoney = new Decimal(storeList[i].totalMoney).add(new Decimal(sqlres[0].packagePrice)).toNumber()
	}
	
	return {
		Alltotal:getTotalMoney(storeList),
		storeList
	}
} 

 
async function getPackageSettleMoney(){
	let sqlRes = await sqlPool.query("SELECT u.id,u.openid, p.money,p.wokerId FROM packageorder p inner join worker w on p.wokerId=w.id inner join user u on w.userId=u.id  WHERE u.phone<>? and p.status=2 and p.settledstatus is null",["15087238064"]).then(res=>res[0])
	let packageList = []
	sqlRes.forEach(item=>{
		let index = -1
		packageList.forEach((e,i)=>{
			if(e.wokerId==item.wokerId) index = i;
		})
		if(index!==-1){
			//有了
			let oldTotalMoney = packageList[index].totalMoney
			packageList[index].totalMoney = new Decimal(oldTotalMoney).add(new Decimal(item.money)).toNumber()
		}else{
			//没有
			packageList.push({
				id:item.id,
				openid:item.openid,
				wokerId:item.wokerId,
				totalMoney:Number(item.money)
			})
		}
	})
	return {
		Alltotal:getTotalMoney(packageList),
		packageList
	}
}

function getTotalMoney(arr){
	let total = 0
	arr.forEach(item=>{
		total = new Decimal(total).add(new Decimal(item.totalMoney)).toNumber()
	})
	return total
}

async function getTotal(){
	let storeInfo = await getStoreSettleMoney()
	let packageInfo = await getPackageSettleMoney()
	let total = new Decimal(storeInfo.Alltotal).add(new Decimal(packageInfo.Alltotal)).toNumber()
	return {
		storeInfo,
		packageInfo,
		total,
		supposedMoney:new Decimal(total).div(new Decimal("0.3")).toFixed(2,Decimal.ROUND_UP)
	}
}

async function startHappy(flag){
    //flag没有就不解冻，有就解冻
	//查需要分账的总金额
	let {total:allToPay,storeInfo,packageInfo} = await getTotal()
	allToPay = new Decimal(allToPay).mul(new Decimal("100")).toNumber()
	//查剩余可分配金额
	let res = await sqlPool.query("SELECT `transaction_id`, `out_trade_no` FROM `topup` where transaction_id is not null order by id desc limit 1").then(res=>res[0]);
	if(res.length==0) {
	    log("分账无充值记录","无充值记录,停止结算")
	    return "无充值记录"
	};
	let {transaction_id,out_trade_no} = res[0]
	let restMoney = await query_profitsharing_amounts(transaction_id).then(res=>res.data.unsplit_amount)
	log("分账查询剩余可分余额",`待结算:${allToPay}余额:${restMoney}`)
	if(allToPay==0){
	    log("无待结算用户，停止分账",`待结算:${allToPay}余额:${restMoney}`)
	    return "无待结算用户"
	}
	if(allToPay>restMoney){
	    log("分账余额不足，停止分账",`待结算:${allToPay}余额:${restMoney} 余额不足,停止结算`)
	     return `待结算:${allToPay}余额:${restMoney}不足,停止结算`
	};
	//开始分账，同时记录分账结果到文件
	log("开始分账",`待结算:${allToPay}余额:${restMoney}`)
	for (let storeUser of storeInfo.storeList) {
		let payToStoreUserMoney = new Decimal(storeUser.totalMoney).mul(new Decimal(PROFIT)).toFixed(2,Decimal.ROUND_DOWN)
		payToStoreUserMoney = new Decimal(payToStoreUserMoney).mul(new Decimal("100")).toNumber()
		let payRes = await create_profitsharing_orders(storeUser.openid,transaction_id,payToStoreUserMoney)
		if(payRes.status==400) {
		    log("超出分账比例",`超出分账比例，分账停止`)
		    return "超出分账比例"
		}
		await sqlPool.query("UPDATE `buyfromstore` SET `settledstatus`=1 WHERE storeId=?",[storeUser.storeId])
		log("商家分账",`storeId:${storeUser.storeId},payMoney:${payToStoreUserMoney}`)
	}
	
	for (let packageUser of packageInfo.packageList) {
		let payToPackageUserMoney = new Decimal(packageUser.totalMoney).mul(new Decimal(PROFIT)).toFixed(2,Decimal.ROUND_DOWN)
		payToPackageUserMoney = new Decimal(payToPackageUserMoney).mul(new Decimal("100")).toNumber()
		let payRes = await create_profitsharing_orders(packageUser.openid,transaction_id,payToPackageUserMoney)
		if(payRes.status==400) {
		    log("超出分账比例",`超出分账比例，分账停止`)
		    return "超出分账比例"
		}
		await sqlPool.query("UPDATE `packageorder` SET `settledstatus`=1 WHERE wokerId=?",[packageUser.id])
		log("快递员分账",`packageUserId:${packageUser.id},payMoney:${payToPackageUserMoney}`)
	}
	//分账结束后解冻剩余金额
	allToPay = new Decimal(allToPay).mul(new Decimal(PROFIT)).div(new Decimal("100")).toFixed(2,Decimal.ROUND_DOWN)
	if(flag){
	    log("分账结束，开始解冻余额",`transaction_id:${transaction_id},out_trade_no:${out_trade_no}`)
	    //结算并解冻
	    let aa = await profitsharing_orders_unfreeze(out_trade_no,transaction_id)
	    log("解冻结束",`解冻结果:${aa}`)
	    await sqlPool.query("INSERT INTO `topup`(`money`, `timestamp`, `totalMoney`, `transaction_id`, `out_trade_no`) VALUES (?,?,?,?,?)",["-"+allToPay,Date.now(),'0',transaction_id,out_trade_no])
	    log("解冻结束","结算并解冻成功")
	    return "结算并解冻成功"
	}else{
	    //结算不解冻
	    log("分账结束，不解冻金额",`查询剩余未解冻金额`)
	     let restMoneyToMysql = await query_profitsharing_amounts(transaction_id).then(res=>res.data.unsplit_amount)
    restMoneyToMysql = new Decimal(restMoneyToMysql).div(new Decimal("100")).toFixed(2,Decimal.ROUND_DOWN)
        log("剩余未解冻金额",restMoneyToMysql)
	await sqlPool.query("INSERT INTO `topup`(`money`, `timestamp`, `totalMoney`, `transaction_id`, `out_trade_no`) VALUES (?,?,?,?,?)",["-"+allToPay,Date.now(),restMoneyToMysql.toString(),transaction_id,out_trade_no])
	    log("不解冻结束","结算且未解冻解冻成功")
	    return "已结算，未解冻"
	}
   
}

// 每天的凌晨1点0分0秒触发 ：'0 0 1 * * *'
schedule.scheduleJob('0 0 1 * * *', ()=>startHappy())


function log(start,msg){
	let time = new Date()
	let year = time.getFullYear()
	let month = time.getMonth()+1
	let day = time.getDate()
	let hour = time.getHours()
	let min = time.getMinutes()
	let sec = time.getSeconds()
	let reCardPath = path.join(__dirname,`../settlerecard/${year}-${month}-${day}`)
	fs.appendFile(reCardPath,`[${start}][${year}-${month}-${day} ${hour}:${min}:${sec}] ${msg}\n`)
}
module.exports = {
	getTotal,
	startHappy
}