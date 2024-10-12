var express = require('express');
var router = express.Router();
const multer = require("multer")

const UserController = require("../manage_controller/UserController.js")
const UpLoadController = require("../manage_controller/UploadController")
const StoreController = require("../manage_controller/StoreController")
const UploadController = require('../manage_controller/UploadController');
const PackageController = require("../manage_controller/PackageController.js")
const PriceController = require("../manage_controller/PriceController.js")


const commondity = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,"public/images/commondityImg")
	},
	filename: function (req, file, cb) {
		const extend = file.originalname.split(".")[1]
		cb(null, Date.now() +"."+ extend)
	}
})


const storage = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,"public/images/orderImg")
	},
	filename: function (req, file, cb) {
		const extend = file.originalname.split(".")[1]
		cb(null, Date.now() +"."+ extend)
	}
})

const swiper = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,"public/images/swiper")
	},
	filename: function (req, file, cb) {
		const extend = file.originalname.split(".")[1]
		cb(null, Date.now() +"."+ extend)
	}
})

const upload = multer({ storage: storage})//快递下单照片,快递送达，商家商品送达都在这里面
const swiperImg = multer({ storage: swiper})//swiper
const commondityImg = multer({storage:commondity})//商家的商品照片,商品送达照片

router.post('/login', UserController.login);
router.get("/getworker",UserController.getworker)
router.patch("/update",UserController.update)
router.get("/getStore",UserController.getStore)
router.patch("/updateStoreStatue",UserController.updateStoreStatue)
router.get("/getallUser",UserController.getallUser)
router.get("/getnotice",UserController.getnotice)
router.patch("/changenotice",UserController.changenotice)
router.patch("/changeSwiper",UserController.changeSwiper)
router.post("/addnotice",swiperImg.single("img"),UserController.addnotice)
router.delete("/deletenotice",UserController.deletenotice)
router.get("/getconcat",UserController.getconcat)
router.patch("/updateconcat",UserController.updateconcat)
router.patch("/setStoreShow",UserController.setStoreShow)

router.post("/upload",commondityImg.single("img"),UpLoadController.upload)

router.post("/updateStore",UpLoadController.updateStore)

router.get("/getsending",StoreController.getsending)

router.get("/getOrder",StoreController.getOrder)

router.get("/getImg",StoreController.getImg)

router.patch("/setstatus",StoreController.setstatus)
router.delete("/deletecom/:id",StoreController.deletecom)

router.patch("/updateStatus",StoreController.updateStatus)

router.post("/uploadImg",commondityImg.single("img"),UpLoadController.uploadImg)
router.post("/uploadpackageImg",upload.single("img"),UpLoadController.uploadpackageImg)

router.get("/getpackage",PackageController.getpackage)
router.patch("/updatePackage",PackageController.updatePackage)
router.patch("/repei",PackageController.repei)
router.get("/getPrice",PackageController.getPrice)
router.patch("/changeProce",PackageController.changeProce)

router.get("/getsettlement",PriceController.getsettlement)
router.get("/settle",PriceController.settle)
router.get("/unfrezz",PriceController.unfrezz)
router.post("/getWxOrders",PriceController.getWxOrders)

module.exports = router;
