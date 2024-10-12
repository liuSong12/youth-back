const jsonwebtoken = require("jsonwebtoken")

const secret = "lsplus"

const JWT = {
	generate(data){
		return jsonwebtoken.sign(data,secret, { expiresIn: 60 * 60 * 24 * 15}); //1个小时：60*60，这里是15天
	},
	verify(token){
		try{
			return jsonwebtoken.verify(token, secret);
		}catch(e){
			return false
		}
	}
}

module.exports = JWT