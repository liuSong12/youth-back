const Result = {
	Success(data=[],msg="成功"){
		return{
			code:1,
			msg,
			data
		}
	},
	Error(msg="未知错误",code=-1){
		return {
			code,
			msg
		}
	}
}

module.exports = Result