const CustomError = require("./../Utils/customError")

const devErrors = (res, err) => {

 res.status(err.statusCode).json({
  status: err.statusCode,
  message: err.message,
  stackTrace: err.stack,
  error: err
 })

 console.log(err)

}

const castErrorHandler = (err) => {
 const msg = `Invalid value for path ${err.path}: ${err.value}`
 return new CustomError(msg, 400)
}

const duplicateKeyError = (err) => {
 const field = Object.keys(err.keyPattern).join()
 const fieldValue = Object.values(err.keyValue).join()
 const msg = `${fieldValue} is already used for ${field}. Please use another value.`
 return new CustomError(msg, 400)
}

const handleValidationError = (err) => {
 const errors = Object.values(err.errors).map(val => val.message)
 const msg = errors.join(" ")
 return new CustomError(msg, 400)
}

const handleTokenExpiredError = (err) => {
 return new CustomError("Login expired. Please loging again.", 401)
}

const handleJsonWebTokenError = (err) => {
 return new CustomError("Invalid token. Please login again", 401)
}

const prodError = (res, err) => {

 if (err.isOperational) {
  res.status(err.statusCode).json({
   status: err.statusCode,
   message: err.message
  })
 } else {
  res.status(500).json({
   status: "error",
   message: "Something went wrong. Please try again later."
  })
 }

}

module.exports = (err, req, res, next) => {
 err.statusCode = err.statusCode || 500
 err.status = err.status || "error"

 if (process.env.NODE_ENV == "development") {
  devErrors(res, err)
 } else if (process.env.NODE_ENV == "production") {
  if (err.name === "CastError") err = castErrorHandler(err)
  if (err.code === 11000) err = duplicateKeyError(err)
  if (err.name === "ValidationError") err = handleValidationError(err)
  if (err.name === "TokenExpiredError") err = handleTokenExpiredError(err)
  if (err.name === "JsonWebTokenError") err = handleJsonWebTokenError(err)

  prodError(res, err)
 } else {
  console.log("This environment is not supported")
 }

}
