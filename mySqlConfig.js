const {MYSQL_CONFIG} = require("./appConfig.js")
const mysql2 = require("mysql2")
const sqlPool = mysql2.createPool(MYSQL_CONFIG).promise()
module.exports = sqlPool