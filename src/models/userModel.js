const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [
      function () {
        return this.loginType !== "google";
      },
      "Password is required for local login",
    ],
  },
  loginType: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  role: {
    type: String,
    enum: {
      values: ["user", "admin"],
      message: "Role must be either 'user' or 'admin'",
    },
    required: [
      function () {
        return this.loginType !== "google";
      },
      "Role is required for local login",
    ],
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// PRE-SAVE MIDDLEWARE 
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
