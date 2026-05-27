const nodemailer = require("nodemailer")

const sendEmail = async (option) => {

 const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
   user: process.env.EMAIL_USERNAME,
   pass: process.env.EMAIL_PASSWORD
  }

 })

 const emailOptions = {
  from: "CineFlex Support<support@cinefle.com>",
  to: option.email,
  subject: option.subject,
  text: option.text
 }

 await transporter.sendMail(emailOptions)

}

module.exports = sendEmail
