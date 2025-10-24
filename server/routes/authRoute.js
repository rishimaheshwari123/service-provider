const express = require("express")
const { registerCtrl, loginCtrl, getAllUsers, editPermissionCtrl, deleteAuthCtrl } = require("../controllers/authCtrl")
const router = express.Router()


router.post("/login", loginCtrl)
router.post("/register", registerCtrl)
router.get("/getAll", getAllUsers)
router.put("/update/:id", editPermissionCtrl)
router.delete("/delete/:id", deleteAuthCtrl)




module.exports = router