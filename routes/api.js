var express = require('express');
var router = express.Router();
const UserController = require("../client_controller/UserController.js")
const AddressController = require("../client_controller/AddresController.js")
const CenterController = require("../client_controller/CenterController.js")
const OrderController = require("../client_controller/OrderController.js")
const StoreController = require("../client_controller/StoreController.js")
const PayController = require("../client_controller/PayController.js")
const multer = require("multer")
const cors = require("cors")

const storage = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,"public/images/orderImg")
	},
	filename: function (req, file, cb) {
		const extend = file.originalname.split(".")[1]
		cb(null, Date.now() +"."+ extend)
	}
})

const storageWorker = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,"public/images/workerImg")
	},
	filename: function (req, file, cb) {
		const extend = file.originalname.split(".")[1]
		cb(null, Date.now() +"."+ extend)
	}
})
const store = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,"public/images/storeImg")
	},
	filename: function (req, file, cb) {
		const extend = file.originalname.split(".")[1]
		cb(null, Date.now() +"."+ extend)
	}
})

const avatar = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,"public/images/avatar")
	},
	filename: function (req, file, cb) {
		const extend = file.originalname.split(".")[1]
		cb(null, Date.now() +"."+ extend)
	}
})

 
const upload = multer({ storage: storage})//快递下单照片，
const createStoreImg = multer({storage:store})//商店照片
const workerImg = multer({storage:storageWorker})//快递员照片
const avatarImg = multer({storage:avatar})//用户头像


router.post('/login',UserController.login);
router.get('/orders',UserController.orders);
router.get("/init",UserController.init)
router.post("/takeOrder",UserController.takeOrder)
router.get("/checkUserInfo",UserController.checkUserInfo)
router.get("/checkInfo",UserController.checkInfo)
router.get("/getNotice",UserController.getNotice)
router.post("/toBeWorker",workerImg.single("orderImg"),UserController.toBeWorker)
router.post("/getOpenid",UserController.getOpenid)
router.get("/addOrder",UserController.addOrder)
router.post("/updateavatar",avatarImg.single("orderImg"),UserController.updateavatar)
router.get("/updatename",UserController.updatename)

router.get("/address",AddressController.showAddress)
router.delete("/removeAddress/:id",AddressController.deleteAddress)
router.put("/updateAddress/:id",AddressController.updateAddr)
router.post("/addAddress",AddressController.addA)

router.get("/center",CenterController.centerInit)
router.get("/createup",CenterController.createup)

router.get("/myOrders",OrderController.myOrders)
router.post("/uploadImg",upload.single("orderImg"),OrderController.uploadImg)
router.post("/createOrder",upload.single("orderImg"),OrderController.createOrder)
router.post("/createO",OrderController.createO)
router.post("/returnMoney",OrderController.returnMoney)


router.get("/getStore",StoreController.getStore)
router.post("/CreateStoreOrder",StoreController.createOrder)
router.post("/createStore",createStoreImg.single("orderImg"),StoreController.createStore)
router.get("/getCommondities",StoreController.getCommondities)

router.post("/pay",PayController.pay)
router.all("/PackagePay",cors(),PayController.PackagePay)
router.all("/StorePay",cors(),PayController.StorePay)
router.all("/topUpPay",cors(),PayController.topUpPay)
router.all("/refund",cors(),PayController.refund)


 
module.exports = router;