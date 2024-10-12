function checkSuper(responseName,wokerName,req){
	if(req){
		const {responseName} = req.userInfo.storeInfo || {}
		const {wokerName} = req.userInfo.workerInfo || {}
		return responseName=="刘松" || wokerName == "刘松"
	}
	return responseName=="刘松" || wokerName == "刘松"
}

module.exports = checkSuper