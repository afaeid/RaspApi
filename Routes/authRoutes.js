const express = require("express")
const router = express.Router()
const authControllers = require("./../Controllers/authControllers")

router.route("/signup").post(authControllers.signup)
router.route("/login").post(authControllers.login)
router.route("/forgotPassword").post(authControllers.forgotPassword)
router.route("/resetPassword/:token").patch(authControllers.resetPassword)
module.exports = router;
