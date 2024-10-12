const Decimal = require("decimal.js");
const sqlPool = require("../mySqlConfig")
const {getTotal} = require("../utils/getSettle.js");
const {profitsharing_orders_unfreeze,query_profitsharing_amounts } = require("../utils/createPayUtil")
const fs = require("fs").promises
const path = require("path")

const PriceSerice = {
	getsettlement:async()=>{
		let topUpdata = await sqlPool.query("SELECT `id`, `money`, `updateTime`, `timestamp`, `totalMoney` FROM `topup` WHERE 1 order by id desc limit 20").then(res=>res[0])
		
		let totalObj = await getTotal()
		return {
			supposedMoney:totalObj.supposedMoney,//应有余额
			total:totalObj.total,//应结算
			topUpdata//充值记录
		}
	},
	unfrezz:async()=>{
	    let res = await sqlPool.query("SELECT `transaction_id`, `out_trade_no` FROM `topup` where transaction_id is not null order by id desc limit 1").then(res=>res[0]);
	    if(res.length==0){
	        log("只解冻金额","数据库无充值记录,停止解冻")
	        return "无充值记录"
	    };
	    let {transaction_id,out_trade_no} = res[0]
	    let restMoneyToMysql = await query_profitsharing_amounts(transaction_id).then(res=>res.data.unsplit_amount);
	    
	    log("查询可解冻余额",`查询单号：transaction_id:${transaction_id},out_trade_no:${out_trade_no},此单号查出的待解冻余额：${restMoneyToMysql}`)
	     
	    if(restMoneyToMysql==0){
	        log("查询解冻余额为0",`查询单号：transaction_id:${transaction_id},out_trade_no:${out_trade_no}`)
	         return "此订单已经解冻"
	    };
	    let a = await profitsharing_orders_unfreeze(out_trade_no,transaction_id)
	    log("解冻结果",`查询单号：transaction_id:${transaction_id},out_trade_no:${out_trade_no},此单解冻结果:${a}`)
	    restMoneyToMysql = new Decimal(restMoneyToMysql).div(new Decimal("100")).toFixed(2,Decimal.ROUND_DOWN)
	    await sqlPool.query("INSERT INTO `topup`(`money`, `timestamp`, `totalMoney`, `transaction_id`, `out_trade_no`) VALUES (?,?,?,?,?)",["-"+restMoneyToMysql,Date.now(),'0',transaction_id,out_trade_no])
	    return "解冻成功"
	}
}

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

module.exports = PriceSerice