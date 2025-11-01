const express = require("express")
const { createAddCtrl, getAllAds, deleteAddCtrl } = require("../controllers/adsCtrl")
const router = express.Router()


router.post("/create", createAddCtrl)
router.get("/getAll", getAllAds)
router.delete("/delete/:id", deleteAddCtrl)


module.exports = router