const sqlPool = require("../mySqlConfig.js")

const UploadService = {
	upload:async(name,price,status,filename,commondityId,superStoreId)=>{
		if(superStoreId!=="undefined"){
			await sqlPool.query("UPDATE `commondity` SET `commondityName`=?,`commondityPrice`=?,`commonditystatus`=?,`commondityimg`=? WHERE id=?",[name,price,status,filename,superStoreId])
			return {name,price,status,filename}
		}
		await sqlPool.query("UPDATE `commondity` SET `commondityName`=?,`commondityPrice`=?,`commonditystatus`=?,`commondityimg`=? WHERE id=?",[name,price,status,filename,commondityId])
		return {name,price,status,filename}
	},
	addCommondity:async(name,price,status,filename,storeId)=>{
		await sqlPool.query("INSERT INTO `commondity`(`storeId`, `commondityName`, `commondityPrice`, `commonditystatus`, `commondityimg`, `saleNum`) VALUES (?,?,?,?,?,?)",[storeId,name,price,status,filename,0])
		return {name,price,status,filename}
	},
	updateStore:async({name,price,status,title,id,showStatus})=>{
		await sqlPool.query("UPDATE `storelist` SET `showStatus`=?,`storeName`=?,`storeStatus`=?,`packagePrice`=?,`notice`=? WHERE id=?",[showStatus,name,status,price,title,id])
	}
}

module.exports = UploadService