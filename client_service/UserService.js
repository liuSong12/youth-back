const sqlPool = require("../mySqlConfig.js")
const axios = require("axios")
const GlobalConfig = require("../appConfig.js")
const JWT = require("../utils/JWT.js")
const {finishOrder} = require("../utils/OrderNotice.js")

const UserService = {
	login: async (code,response) =>{
		const {access_token} = await axios(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${GlobalConfig.APP_ID}&secret=${GlobalConfig.SECRET}`).then(res=>res.data)
		const {phone_info} = await axios.post(`https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`,{code}).then(res=>res.data)
		//phone_info.phoneNumber
		//存数据库
		let res = await sqlPool.query("SELECT `id`,`avatar`,`defaultAddress`,`lastOperateTime`,`nikeName`,`orderNumber`, `receiveNumber`, `identity` FROM `user` WHERE phone=?",[phone_info.phoneNumber])
		if(res[0].length===0){
			//注册
			await sqlPool.query("INSERT INTO `user` (`phone`, `orderNumber`, `receiveNumber`, `identity`) VALUES (?,?,?,?)",[phone_info.phoneNumber,0,0,0])
			res = await sqlPool.query("SELECT `id`,`avatar`,`defaultAddress`,`lastOperateTime`,`nikeName`,`orderNumber`, `receiveNumber`, `identity` FROM `user` WHERE phone=?",[phone_info.phoneNumber])
		}
		let token = JWT.generate({...res[0][0],client:1})//client:1表示小程序加密，client：0表示管理端加密
		response.header("Authorization",token)
		return res[0]
	},
	orders:async ()=>{
		let res = await sqlPool.query("SELECT a.addressInfo, p.id, p.weight,p.status, p.number, p.inputData, p.orderTime, p.money, p.orderImgArr FROM packageorder p inner join address a on p.addressId=a.id WHERE p.status=? order by p.id desc",[0]).then(res=>res[0])
		return res.map(item=>{
			if(item.orderImgArr){
				return {
					...item,
					orderImgArr:item.orderImgArr.split(",")
				}
			}else{
				return item
			}	
		})
	},
	getNotice:async()=>{
		let notices = await sqlPool.query("SELECT `id`, `text`,`work` FROM `notice` WHERE isdefault=?",[1]).then(res=>res[0])
		let swipers = await sqlPool.query("SELECT `id`, `content` FROM `swipertext` WHERE 1 order by num").then(res=>res[0])
		let price = await sqlPool.query("SELECT `price` FROM `price` WHERE 1").then(res=>res[0])
		let priceArr = []
		function add(index){
			if(index===price.length/6) return; //长度：42
			let newArr = []
			for (var i = 0; i < 6; i++) {
				newArr.push(price[index*6+i].price)
			}
			priceArr.push(newArr)
			index++
			add(index)
		}
		add(0)
		return {
			notices,swipers,priceArr
		}
	},
	takeOrder:async(orderId,id)=>{
		const res = await sqlPool.query("SELECT `status` FROM `packageorder` WHERE id=?",[orderId]).then(res=>res[0])
		if(res[0].status==0){
			await sqlPool.query("UPDATE `user` SET `lastOperateTime`=now() WHERE id=?",[id])
			return await sqlPool.query("UPDATE `packageorder` SET `status`=?,`wokerId`=? WHERE id=?",[1,id,orderId])
		}else{
			return -1
		}
	},
	toBeWorker:async({wokerName,workerPhone,studentImg,userId})=>{
		await sqlPool.query("UPDATE `user` SET `identity`=?,`lastOperateTime`=now() WHERE id=?",[3,userId])
		await sqlPool.query("INSERT INTO `worker`(`wokerName`, `workerPhone`, `studentImg`, `userId`) VALUES (?,?,?,?)",[wokerName,workerPhone,studentImg,userId])
	},
	checkInfo:async(userId)=>{
		let identityflag = await sqlPool.query("SELECT `identity` FROM `user` WHERE id=?",[userId]).then(res=>res[0])
		let info =  await sqlPool.query("SELECT `wokerName`, `workerPhone`, `studentImg` FROM `worker` WHERE userId=?",[userId]).then(res=>res[0])
		return {
			identityflag,info
		}
	},
	checkUserInfo:async(userId)=>{
		let storeStatus = await sqlPool.query("SELECT `storeStatus` FROM `storelist` WHERE userId=?",[userId]).then(res=>res[0])
		let info = await sqlPool.query("SELECT `responseName`, `responsePhone`, `storeImgArr` FROM `storelist` WHERE userId=?",[userId]).then(res=>res[0])
		return {
			storeStatus,info
		}
	},
	getOpenid:async(code,userId)=>{
		let {openid,session_key} = await axios(`https://api.weixin.qq.com/sns/jscode2session?appid=${GlobalConfig.APP_ID}&secret=${GlobalConfig.SECRET}&js_code=${code}&grant_type=authorization_code`).then(res=>res.data)
		await sqlPool.query("UPDATE `user` SET `openid`=?,`session_key`=?,`lastOperateTime`=now() WHERE id=?",[openid,session_key,userId])
	},
	
	addOrder:async(userId,orderId)=>{
		let sqlRes = await sqlPool.query("SELECT `receiveNumber`,`openid` FROM `user` WHERE id=?",[userId]).then(res=>res[0])
		let num = (Number(sqlRes[0].receiveNumber) + 1).toString()
		await sqlPool.query("UPDATE `user` SET `lastOperateTime`=now(),`receiveNumber`=? WHERE id=?",[num,userId])
		let orderResult = await sqlPool.query("SELECT `money`,`userId`,`addressId` FROM `packageorder` WHERE id=?",[orderId]).then(res=>res[0])
		let {money,userId:orderUserId,addressId} = orderResult[0]
		let openid = sqlRes[0].openid
		
		//发送订阅信息
		let orderUserSql = await sqlPool.query("SELECT `openid` FROM `user` WHERE id=?",[orderUserId]).then(res=>res[0])
		let addressSQL = await sqlPool.query("SELECT `addressInfo` FROM `address` WHERE id=?",[addressId]).then(res=>res[0])
		let address = addressSQL[0].addressInfo
		await finishOrder(orderUserSql[0].openid,money,address)
	}
}

module.exports = UserService