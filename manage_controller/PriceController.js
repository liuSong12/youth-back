const PriceSerice = require("../manage_service/PriceSerice");
const checkSuper = require("../utils/checkSuper");
const { startHappy } = require("../utils/getSettle");
const { Error, Success } = require("../utils/Result");
const pay = require("../utils/payConfig")
const fs = require("fs").promises
const path = require("path")

const PriceController = {
	getsettlement:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			let sqlRes = await PriceSerice.getsettlement()
			res.send(Success(sqlRes))
		}catch(e){
			console.log(e)
			res.send(Error())
		}
	},
	settle:async(req,res)=>{
		try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
			let sqlRes;
			if(req.query.type!=="undefined"){
			    sqlRes = await startHappy(1)    
			}else{
			    sqlRes = await startHappy()
			}
			res.send(Success(sqlRes))
		}catch(e){
		    console.log(e)
			res.send(Error())
		}
	},
	unfrezz:async(req,res)=>{
	    try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
		    let sqlRes = await PriceSerice.unfrezz()
			res.send(Success(sqlRes))
		}catch(e){
		    console.log(e)
			res.send(Error())
		}
	},
	getWxOrders:async(req,res)=>{
	     try{
			if(!checkSuper(null,null,req)){
				res.send(Error("无权"))
				return;
			}
            let billRes = await pay.fundflowbill({bill_date:req.body.date})
            if(billRes.status==400) {
                res.send(Error(billRes.message))
                return;
            }
            const {hash_type,hash_value,download_url} = billRes
            let bill = await pay.downloadbill(download_url)
            let time = new Date()
        	let year = time.getFullYear()
        	let month = time.getMonth()+1
        	let day = time.getDate()
        	let hour = time.getHours()
        	let min = time.getMinutes()
        	let sec = time.getSeconds()
        	let reCardPath = path.join(__dirname,`../settlerecard/${req.body.date}微信账单.txt`)
        	fs.writeFile(reCardPath,`${bill.data}\n`)
			res.send(Success(bill))
		}catch(e){
			res.send(Error(e))
		}
	}
}

module.exports = PriceController