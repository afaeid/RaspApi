const express = require("express");
const app = express();
app.set("trust proxy", 1);

const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp"); //hadn't added yet
const CustomError = require("./Utils/customError");
const globalErrorHandler = require("./Controllers/errorControllers");
const moviesRouter = require("./Routes/moviesRoutes");
const authRouter = require("./Routes/authRoutes");
const userRouter = require("./Routes/userRoutes");
const path = require("path");

if (process.env.NODE_ENV == "development") {
 app.use(morgan("dev"))
}

app.get("/docs", (req, res) => {
  res.sendFile(
    path.join(__dirname, "/public", "cineflex-api-docs.html")
  );
});

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
app.use(hpp({whitelist: ["price","name","duration","ratings","totalRatings","releaseYear"]}))

// app.use(hpp({
//  whitelist: [
//   "duration",
//   "ratings",
//   "releaseYear",
//   "releaseDate",
//   "genres",
//   "directors",
//   "actors",
//   "price"
//   ]
// }))

app.use("/api/v1/movies", moviesRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)

app.all("*", (req, res, next) => {
 // res.status(400).json({
 //  status: "fail",
 //  message: `The page ${req.originalUrl} is not found in the server`
 // })

 // const err = new Error(`The page ${req.originalUrl} is not found in the server`)
 // err.statusCode = 400
 // err.status = "fail"

 const err = new CustomError(`The page ${req.originalUrl} is not found in the server`, 404)

 next(err)
})

app.use(globalErrorHandler)

module.exports = app;
