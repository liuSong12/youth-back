const JWT = require("./JWT.js")
const sqlPool = require("../mySqlConfig.js")
async function checkToken(req,res,next){
	let urlNextArr = ["/api/login","/api/getNotice","/api/getStore","/api/checkPay","/api/refund","/api/StorePay","/manage/login","/api/topUpPay","/api/PackagePay"]
	if(urlNextArr.includes(req.url)){
		next();
		return;
	}
	const token = req.headers["authorization"]&&req.headers["authorization"].split(" ")[1]
	if(token){
		const payload = JWT.verify(token)
		if(payload){
		    try {
		        let newInfo = await findInfo(payload)
    			const newToken = JWT.generate(newInfo)
    			res.header("Authorization",newToken)
    			req.userInfo = newInfo
    			next()
		    } catch (e) {
		        res.status(401).send({ok:-1,errInfo:"token过期"})
		    }
		}else{
			res.status(401).send({ok:-1,errInfo:"token过期"})
		}
	}else{
		res.status(401).send({ok:-1,errInfo:"token过期"})
	}
}


async function findInfo(payload){
	if(payload.client==1){
		//小程序的
		let resultObj = await sqlPool.query("SELECT `id`,`avatar`,`defaultAddress`,`lastOperateTime`,`nikeName`,`orderNumber`, `receiveNumber`, `identity` FROM `user` WHERE id=?",[payload.id])
		let {id,avatar,defaultAddress,nikeName,orderNumber,receiveNumber,identity,lastOperateTime} = resultObj[0][0]
		return {avatar,defaultAddress,lastOperateTime,id,nikeName,orderNumber,receiveNumber,identity,client:1}
	}else{
		//管理端的
		let storeCheck=[], packageCheck=[];
		if(payload.storeInfo){
			storeCheck = await sqlPool.query("SELECT `id`,`showStatus`,`storeName`, `responseName`, `responsePhone`, `storeImgArr`, `storeStatus`, `packagePrice`, `notice`, `userId` FROM `storelist` WHERE id=?",[payload.storeInfo.id]).then(res=>res[0])
		}
		if(payload.workerInfo){
			packageCheck = await sqlPool.query("SELECT `id`, `wokerName`, `workerPhone`, `studentImg`, `userId` FROM `worker` WHERE id=?",[payload.workerInfo.id]).then(res=>res[0])
		}
		if(packageCheck.length!==0){
			let ident = await sqlPool.query("SELECT `identity` FROM `user` WHERE id=?",[packageCheck[0].userId]).then(res=>res[0])
			if(ident[0].identity==2){
				throw new Error("小黑屋警告")
				return
			}
		}
		if(storeCheck.length!==0){
		    
			let ident = await sqlPool.query("SELECT `storeStatus` FROM `storelist` WHERE id=?",[storeCheck[0].id]).then(res=>res[0])
			if(ident[0].storeStatus==2){
				throw new Error("管理员退回审核")
				return
			}
		}
		return {
			storeInfo:storeCheck[0]?storeCheck[0]:null,//{...}:null
			workerInfo:packageCheck[0]?packageCheck[0]:null,
			client:0
		}
		
	}
}


module.exports = checkToken