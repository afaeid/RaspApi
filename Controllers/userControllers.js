const User = require("./../models/userModel")
const asyncErrorHandler = require("./../Utils/asyncErrorHandler")
const CustomError = require("./../Utils/customError")
const jwt = require("jsonwebtoken")
const util = require("util")
const sendEmail = require("./../Utils/email")
const crypto = require("crypto")
const authControllers = require("./authControllers")

const signToken = id => {
 return jwt.sign({ id }, process.env.SECRET_STR, {
  expiresIn: process.env.LOGIN_EXPIRES
 })
}

const createSendResponse = (res, user, statusCode) => {
 const token = signToken(user._id)
 
 const options = {
  maxAge: 2592000000,
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

const filterReqObj = (obj, ...allowedFields) => {
 const newObj = {};
 Object.keys(obj).forEach(prop => allowedFields.includes(prop) ? newObj[prop] = obj[prop] : null)
 return newObj
}

exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
 const users = await User.find()
 
 res.status(200).json({
  status: "success",
  length: users.length,
  data: {
   users
  }
 })
})

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
 // GET CURRENT USER DATA FROM DATABASE
 const user = await User.findById(req.user._id).select("+password")
 // CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT 
 const isPassMatched = await user.comparePassInDB(req.body.currentPassword, user.password);
 if (!isPassMatched) return next(new CustomError("The provided password is not same to the current password", 401))
 // IF THE CURRENT PASSWORD IS CORRECT, UPDATE USER PASSWORD WITH MEW PASSWORD 
 user.password = req.body.password
 user.confirmPassword = req.body.confirmPassword
 user.passwordChangedAt = Date.now()
 await user.save()
 // LOGIN USER AND SEND JWT TO THE USER
 createSendResponse(res, user, 200)
})

exports.updateMe = asyncErrorHandler(async (req, res, next) => {
 
 if (req.body.password || req.body.confirmPassword) {
  return next(new CustomError("You cannot update your password using this endpoint.", 401))
 }
 
 const filterObj = filterReqObj(req.body, "name", "email")
 const updatedUser = await User.findByIdAndUpdate(req.user._id, filterObj, {runValidators: true, new: true})
 res.status(200).json({
  status: "success",
  data: {
   updatedUser
  }
 })
 
})

exports.deleteMe = asyncErrorHandler(async (req, res, next)=>{
 await User.findByIdAndUpdate(req.user._id, {active: false}, {runValidators: false, new: true})
 res.status(204).json({
  status: "success",
  data: null
 })
})
