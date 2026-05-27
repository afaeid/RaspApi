class customError extends Error {
 constructor(message, statusCode) {
  super(message)
  this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
  this.statusCode = statusCode
  this.isOperational = true;

  Error.captureStackTrace(this, this.constructor)
 }
}


module.exports = customError;
