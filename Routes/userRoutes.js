const express = require("express")
const router = express.Router()
const authControllers = require("./../Controllers/authControllers")
const userControllers = require("./../Controllers/userControllers")

router.route("/getAllUsers").get(userControllers.getAllUsers)
router.route("/updatePassword").patch(authControllers.protect, userControllers.updatePassword)
router.route("/updateMe").patch(authControllers.protect, userControllers.updateMe)
router.route("/deleteMe").delete(authControllers.protect, userControllers.deleteMe)
module.exports = router;
