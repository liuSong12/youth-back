const sqlPool = require("../mySqlConfig");
const JWT = require("../utils/JWT")
let myIo;
const SocketController = {
	connection:(socket,io)=>{
		myIo = io
		let payload = JWT.verify(socket.handshake.query.token)
		if(!payload) return;
		socket.userInfo = payload
	},
	disconnect:(socket,io)=>{
		myIo = io
	},
	newPackage:async ()=>{
		try{
			if(!myIo) return;
			let num = await sqlPool.query("SELECT count(*) num FROM `packageorder` WHERE status=0").then(res=>res[0])
			myIo.sockets.emit("newPackage",num[0].num)
		}catch(e){
		    console.log(e,"<--soket")
		}
	},
	newStoreOrder:async(phone,storeId)=>{
		try{ 
			if(!myIo) return;
			let num = await sqlPool.query("SELECT count(*) num FROM `buyfromstore` WHERE status=0 and storeId=?",[storeId]).then(res=>res[0])
			myIo.sockets.emit("newStoreOrder",{num:num[0].num,phone})
		}catch(e){
		    console.log(e,"<===soket")
		}
	}
}
module.exports = SocketController