const User = require("./../models/userModel")
const asyncErrorHandler = require("./../Utils/asyncErrorHandler")
const CustomError = require("./../Utils/customError")
const jwt = require("jsonwebtoken")
const util = require("util")
const sendEmail = require("./../Utils/email")
const crypto = require("crypto")


const signToken = id => {
 return jwt.sign({ id }, process.env.SECRET_STR, {
  expiresIn: process.env.LOGIN_EXPIRES
 })
}

const createSendResponse = (res, user, statusCode) => {
 const token = signToken(user._id)
 const options = {
  maxAge: 2592000000,
  secure: true,
  httpOnly: true
 }

 res.cookie("JWT", token, options)

 res.status(statusCode).json({
  status: "success",
  data: {
   user
  }
 })
 
}

exports.signup = asyncErrorHandler(async (req, res, next) => {
 const newUser = await User.create(req.body)


 createSendResponse(res, newUser, 201)
})


exports.login = asyncErrorHandler(async (req, res, next) => {
 const { email, password } = req.body;

 if (!email || !password) {
  const error = new CustomError("Please give email & password", 400)
  return next(error)
 }

 const user = await User.findOne({ email }).select("+password")

 if (!user) {
  return next(new CustomError("This email is not found.", 404))
 }

 const isPassMatched = await user.comparePassInDB(password, user.password)

 if (!isPassMatched) {
  const error = new CustomError("Incorrect email or password.", 400)

  return next(error)
 }

 createSendResponse(res, user, 200)
})

exports.protect = asyncErrorHandler(async (req, res, next) => {
  console.log("AUTH HEADER:", req.headers.authorization);
  console.log("SECRET EXISTS:", !!process.env.SECRET_STR);
 const testToken = req.headers.authorization
 let token;
// console.log(testToken)
 if (testToken && testToken.startsWith("Bearer")) {
  token = testToken.split(" ")[1]
 }
 console.log("TOKEN:", token);

 if (!testToken) {
  next(new CustomError("Not authorized. Please login again.", 401))
 }

 const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR)

 const user = await User.findById(decodedToken.id).select("+passwordChangedAt")

 if (!user) {
  next(new CustomError("User with the given token doesn't exist. Please sign up."))
 }

 const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
 if (isPasswordChanged) {
  return next(new CustomError("Recently the password has been changed. Please login again.", 401))
 }
 req.user = user;
 next()
})

exports.restrict = (role) => {
 return (req, res, next) => {
  if (req.user.role !== role) {
   next(new CustomError("You are not permitted to perform this action", 403))
  }

  next()
 }
}
// If there are multiple roles
// exports.restrict = (...role)=>{
//  return (req, res, next)=>{
//   if (!role.includes(req.user.role)) {
//    next(new CustomError("You are not permitted to perform this action", 403))
//   }

//   next()
//  }
// }


exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
 const user = await User.findOne({ email: req.body.email })

 if (!user) next(new CustomError(`User not found with the email ${req.body.email}`, 404))

 const token = user.createResetPasswordToken()

 await user.save({ validateBeforeSave: false })

 const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/resetPassword/${token}`
 const message = `We have received your password reset request. Please click the below url to reset your password:\n\n${resetUrl}\n\n This url will be validated only for 10 minutes. \n Don't share it publicly.`
 try {
  await sendEmail({
   email: user.email,
   subject: "Password reset request has been received",
   text: message
  })

  res.status(200).json({
   status: "success",
   email: user.email,
   token: token,
   resetEndPoint: resetUrl,
   message: "Password reset token has been sent to the email."
  })

 } catch (e) {
  user.passwordResetToken = undefined
  user.passwordResetTokenExpires = undefined
  await user.save({ validateBeforeSave: false })
  console.log(e)
  return next(new CustomError("Failed to send email. Please try again later.", 500))
 }

})


exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
 const token = req.params.token

 const user = await User.findOne({ passwordResetToken: crypto.createHash("sha256").update(token).digest("hex"), passwordResetTokenExpires: { $gt: Date.now() } })

 if (!user) return next(new CustomError("Invalid token or token has expired", 400))

 user.password = req.body.password
 user.confirmPassword = req.body.confirmPassword
 user.passwordResetToken = undefined
 user.passwordResetTokenExpires = undefined
 user.passwordChangedAt = Date.now()
 await user.save()

 createSendResponse(res, user, 200)
})
