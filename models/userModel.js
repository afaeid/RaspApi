const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
 name: {
  type: String,
  required: [true, "Please enter your name."]
 },
 email: {
  type: String,
  required: [true, "Please give an email."],
  unique: [true, "This name is used"],
  lowercase: true,
  validate: [validator.isEmail, "Please emter a valid email."]
 },
 photo: String,
 password: {
  type: String,
  required: [true, "Please enter your password."],
  minlength: 8,
  select: false

 },
 confirmPassword: {
  type: String,
  required: [true, "Please confirm your password."],
  validate: {
   validator: function(val) {
    return val === this.password
   },
   message: "Password and confirm password must be same"
  }
 },
 role: {
  type: String,
  enum: ["admin", "user"],
  default: "user"
 },
 passwordChangedAt: {
  type: Date,
  select: false
 },
 passwordResetToken: String,
 passwordResetTokenExpires: Date,
 active: {
  type: Boolean,
  default: true
 }

})

userSchema.pre("save", async function(next) {
 if (!this.isModified("password")) return next()

 this.password = await bcrypt.hash(this.password, 12);
 this.confirmPassword = undefined;

 next()
})

userSchema.pre(/^find/, function(next) {
 this.find({ active: {$ne: false } })
 next()
})

userSchema.methods.comparePassInDB = async (psswd, psswdDB) => {
 return await bcrypt.compare(psswd, psswdDB)
}

userSchema.methods.isPasswordChanged = async function(JWTTimestamp) {
 if (this.passwordChangedAt) {
  const psswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
  console.log(psswdChangedTimestamp, JWTTimestamp)
  return psswdChangedTimestamp > JWTTimestamp
 }
 return false;
}

userSchema.methods.createResetPasswordToken = function() {
 const resetToken = crypto.randomBytes(12).toString("hex")
 this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
 this.passwordResetTokenExpires = Date.now() + (10 * 60 * 1000)

 return resetToken
}

const User = mongoose.model("User", userSchema)

module.exports = User;
