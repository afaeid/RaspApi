const env = require("dotenv")
env.config({ path: "./.env" })
const mongoose = require("mongoose");

if (process.argv[2] === "--prod") {
 process.env.NODE_ENV = "production"
} else if (process.argv[2] === "--dev") {
 process.env.NODE_ENV = "development"
}

mongoose.connect(process.env.DB === "cloud" ? process.env.REMOTE_DB_CON_STR : process.env.LOCAL_DB_CON_STR)
 .then(con => {
  console.log("Database has been connected properly")
 })

process.on("uncaughtException", (err) => {

 console.log(err.name, err.message)
 console.log("Uncaught Exception occured. Shutting down...")

 process.exit(1)

})
