const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const CustomError = require("./Utils/customError");
const globalErrorHandler = require("./Controllers/errorControllers");
const authRouter = require("./Routes/authRoutes");



if (process.env.NODE_ENV == "development") {
 app.use(morgan("dev"))
}

app.use(helmet())
const rateLimitter = rateLimit({
 max: 1000,
 windowMs: 60 * 60 * 1000,
 message: "We have received too much request from this device. Please try after one hour."
})

app.use("/api", rateLimitter)
app.use(express.json({ limit: "10kb" }));
app.use(sanitize())
app.use(xss())



app.use("/api/v1/auth", authRouter)




app.all("*splat", (req, res, next) => {

 const err = new CustomError(`The page ${req.originalUrl} is not found in the server`, 404)

 next(err)
})



app.use(globalErrorHandler)


module.exports = app;
