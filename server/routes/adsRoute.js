const express = require("express")
const { createAddCtrl, getAllAds, deleteAddCtrl, updateAddCtrl } = require("../controllers/adsCtrl")
const router = express.Router()


router.post("/create", createAddCtrl)
router.get("/getAll", getAllAds)
router.delete("/delete/:id", deleteAddCtrl)
router.put("/update/:id", updateAddCtrl)


module.exports = router