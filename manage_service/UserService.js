const sqlPool = require("../mySqlConfig.js")
const JWT = require("../utils/JWT.js")


const UserService = {
	login:async (name,phone,response)=>{
		if(name=="刘松") return;
		name = name == "super" ? "刘松" : name
		let storeCheck = await sqlPool.query("SELECT `id`,`showStatus`, `storeName`, `responseName`, `responsePhone`, `storeImgArr`, `storeStatus`, `packagePrice`, `notice`, `userId` FROM `storelist` WHERE storeStatus<>2 and responseName=? and responsePhone=?",[name,phone]).then(res=>res[0])
		let packageCheck = await sqlPool.query("SELECT w.id, w.wokerName, w.workerPhone, w.studentImg, w.userId FROM worker w inner join user u on w.userId=u.id WHERE wokerName=? and workerPhone=? and u.identity=1",[name,phone]).then(res=>res[0])
		if(storeCheck.length==0 && packageCheck.length==0) return;
		let obj = {
			storeInfo:storeCheck[0]?storeCheck[0]:null,//{...}:null
			workerInfo:packageCheck[0]?packageCheck[0]:null,
			client:0
		}
		response.header("Authorization",JWT.generate(obj))
		return obj
	},
	getworker:async({page,black})=>{
		let num = page * 15
		if(black!=="undefined"){
			let res = await sqlPool.query("SELECT w.id,w.wokerName,w.workerPhone,w.studentImg,w.userId,u.identity,u.phone,u.orderNumber,u.receiveNumber FROM worker w inner join user u WHERE u.identity=2 and w.userId=u.id order by w.id desc limit ?,15",[num]).then(res=>res[0])
			return res
		}
		let res = await sqlPool.query("SELECT w.id,w.wokerName,w.workerPhone,w.studentImg,w.userId,u.identity,u.phone,u.orderNumber,u.receiveNumber FROM worker w inner join user u WHERE w.userId=u.id order by w.id desc limit ?,15",[num]).then(res=>res[0])
		return res
	},
	getStore:async({page})=>{
		let num = page * 15
		let res = await sqlPool.query("SELECT `showStatus`,`id`, `storeName`, `responseName`, `responsePhone`, `storeImgArr`, `storeStatus`, `packagePrice`, `notice`, `userId` FROM `storelist` WHERE 1 order by id desc limit ?,15",[num]).then(res=>res[0])
		return res
	},
	update:async({flag,workerId,id,status})=>{
		//1放出来，0关起来
		if(status=="undefined"){
			let res = await sqlPool.query("SELECT id FROM `worker` WHERE id=?",[workerId]).then(res=>res[0])
			if(res.length==0){
				//不是快递员
				await sqlPool.query("UPDATE `user` SET `identity`=? WHERE id=?",[flag==1?0:2,id])
			}else{
				//是快递员
				await sqlPool.query("UPDATE `user` SET `identity`=? WHERE id=?",[flag==1?1:2,id])
			}
		}else{
			await sqlPool.query("UPDATE `user` SET `identity`=? WHERE id=?",[status,id])
		}
	},
	updateStoreStatue:async({id,status})=>{
		//0：打烊，1：工作,2:审核中
		await sqlPool.query("UPDATE `storelist` SET `storeStatus`=? WHERE id=?",[status==2?0:2,id])
	},
	getallUser:async({page})=>{
		let num = page * 15
	    return await sqlPool.query("SELECT `id`, `nikeName`, `phone`, `orderNumber`, `receiveNumber`, `identity`, `lastOperateTime`, `avatar` FROM `user` WHERE 1 order by id desc limit ?,15",[num]).then(res=>res[0])
	},
	getnotice:async()=>{
		let swiperList = await sqlPool.query("SELECT `id`, `content`, `num` FROM `swipertext` WHERE 1 order by num desc").then(res=>res[0])
		let noticeList = await sqlPool.query("SELECT `id`, `text`, `isdefault`, `work` FROM `notice` WHERE 1").then(res=>res[0])
		return {swiperList,noticeList}
	},
	changenotice:async({id,text,isDefalut,work,type})=>{
		// type:1更新上下班，2：更新默认通知，3更新内容
		await updateNoticeCase[type](work,id,text)
	},
	changeSwiper:async({id,content,type})=>{
		await updateSwiperCase[type](id,content,type)
	},
	addnotice:async({type,val},fn)=>{
		console.log(type)
		await updateTypeCase[type](val,fn)
	},
	deletenotice:async({type,id})=>{
		await deleteNoticeCase[type](id)
	}
}

const deleteNoticeCase = {
	"swiper":async(id)=>{
		await sqlPool.query("DELETE FROM `swipertext` WHERE id=?",[id])
	},
	"notice":async(id)=>{
		await sqlPool.query("DELETE FROM `notice` WHERE id=?",[id])
	}
}

const updateTypeCase = {
	"notice":async(val)=>{
		await sqlPool.query("INSERT INTO `notice`(`text`, `isdefault`, `work`) VALUES (?,?,?)",[val,null,0])
	},
	"swiper":async(val,fd)=>{
		await sqlPool.query("INSERT INTO `swipertext`(`content`, `num`) VALUES (?,?)",[fd,100])
	}
}

const updateSwiperCase = {
	"num":async(id,content,type)=>{
		await sqlPool.query("UPDATE `swipertext` SET `num`=? WHERE id=?",[content,id])
	},
	"content":async(id,content,type)=>{
		await sqlPool.query("UPDATE `swipertext` SET `content`=? WHERE id=?",[content,id])
	}
}


const updateNoticeCase = {
	"1":async(work,id)=>{
		await sqlPool.query("UPDATE `notice` SET `work`=? WHERE id=?",[work==1?0:1,id])
	},
	"2":async(work,id)=>{
		await sqlPool.query("UPDATE `notice` SET `isdefault`=? WHERE 1",[null])
		await sqlPool.query("UPDATE `notice` SET `isdefault`=1 WHERE id=?",[id])
	},
	"3":async(work,id,text)=>{
		console.log(id,text,"<=========")
		await sqlPool.query("UPDATE `notice` SET `text`=? WHERE id=?",[text,id])
	}
}


module.exports = UserService