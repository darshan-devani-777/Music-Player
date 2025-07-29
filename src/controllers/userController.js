const axios = require("axios");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const sendEmail = require("../utils/sendEmail");
const { encryptData, decryptData } = require("../utils/crypto");

// SIGNUP USER
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    console.log("👤 Register Attempt:");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Role:", role);
    console.log("Password:", password);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User already exists with this email",
      });
    }

    const userDetails = {
      name,
      email,
      password,
      role,
      loginType: "local",
    };

    const { encryptedData, iv , key} = encryptData(userDetails);

    console.log("🔐 Encrypted User Data:", encryptedData);
    console.log("🧊 IV:", iv);

    // Decrypt Data Verify
    const decrypted = decryptData(encryptedData, iv);
    console.log("✅ Decrypted Data:", decrypted);

    const newUser = await User.create({
      name,
      email,
      password,
      loginType: "local",
      role,
    });

    res.status(201).json({
      status: true,
      message: "User Registered Successfully...",
      data: {
        encryptedUserData: encryptedData,
        iv: iv,
        key,
      },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    console.log("👤 Login Attempt:");
    console.log("📧 Email:", email);
    console.log("📝 Entered password:", password);
    console.log("🔑 Stored hashed password:", user?.password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const userDetails = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      loginType: user.loginType || 'manual',
    };

    // Encrypt Data
    const { encryptedData, iv , key} = encryptData(userDetails);

    console.log("🔐 Encrypted User Data:", encryptedData);
    console.log("🧊 IV:", iv);
    console.log("🧊 KEY:", key);

    // Decrypt Data Verify
    const decrypted = decryptData(encryptedData, iv);
    console.log("✅ Decrypted User Data:", decrypted);

    // Send Response
    res.status(200).json({
      status: true,
      message: "User Login Successfully...",
      data: {
        encryptedUserData: encryptedData,
        iv: iv,
        key: key,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET ALL USER
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      status: true,
      message: "User Fetched Successfully...",
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const updatedUserDetails = {
      name: req.body.name || user.name,
      email: req.body.email || user.email,
      role: req.body.role || user.role,
      loginType: user.loginType,
    };

    const { encryptedData, iv , key} = encryptData(updatedUserDetails);

    console.log("🔐 Encrypted User Data:", encryptedData);
    console.log("🧊 IV:", iv);

    const decrypted = decryptData(encryptedData, iv);
    console.log("✅ Decrypted User Data:", decrypted);

    user.name = updatedUserDetails.name;
    user.email = updatedUserDetails.email;
    user.role = updatedUserDetails.role;
    user.loginType = updatedUserDetails.loginType;

    await user.save();

    res.status(200).json({
      status: true,
      message: "User Updated Successfully...",
      data: {
        encryptedUserData: encryptedData,
        iv: iv,
        key: key,
      },
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User Deleted Successfully...",
      data: {
        _id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete user",
    });
  }
};

// GOOGLE SIGNUP
exports.googleSignup = async (req, res) => {
  try {
    const user = req.user;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const payload = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };

    // Encode and redirect to React
    const encoded = encodeURIComponent(JSON.stringify(payload));

    res.redirect(`http://localhost:5173/auth/google/callback?data=${encoded}`);
  } catch (error) {
    res.redirect(
      `http://localhost:5173/auth/google/callback?error=${encodeURIComponent(
        "Google login failed"
      )}`
    );
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found with this email",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `http://${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Email content
    const html = `
  <div style="max-width: 500px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="text-align: center; color: #333;">Reset Your Password</h2>
    <p style="color: #555;">Hi ${user.fullName || "there"},</p>
    <p style="color: #555;">
      We received a request to reset your password. Click the button below to set a new password.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #007bff; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color: #888; font-size: 14px;">
      This link will expire in 15 minutes. If you didn’t request a password reset, please ignore this email.
    </p>
    <p style="color: #aaa; font-size: 13px; margin-top: 30px;">
      — The Support Team
    </p>
  </div>
`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html,
    });

    res.status(200).json({
      status: true,
      message: "Password reset email sent successfully...",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  try {
    if (!token || !newPassword || !confirmPassword) {
      console.log("Missing fields");
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: false,
        message: "New password and confirm password do not match",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("Resetting password for:", user.email);
    console.log("Raw password to be hashed by middleware:", newPassword);

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user
      .save()
      .then(() => {
        console.log("User saved successfully");
      })
      .catch((err) => {
        console.error("Error saving user:", err);
      });

    return res.status(200).json({
      status: true,
      message: "Password has been reset successfully...",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GUEST TOKEN
exports.generateGuestToken = async (req, res) => {
  try {
    const payload = {
      name: "Guest",
      role: "guest",
    };

    const guestToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.status(200).json({
      status: true,
      message: "Guest token generated successfully...",
      guestToken,
    });
  } catch (error) {
    console.error("Guest token error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to generate guest token",
    });
  }
};

// GOOGLE LOGIN WITH TOKEN
exports.googleLoginWithToken = async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: "No access token provided" });
  }

  try {
    // Get user info from Google
    const googleRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { name, email, picture } = googleRes.data;

    let user = await User.findOne({ email });

    if (user) {
      if (user.loginType !== "google") {
        return res.status(400).json({
          error: `This email is already registered using ${user.loginType}. Please log in using that method.`,
        });
      }

      return res.json({
        accessToken: user.accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          loginType: user.loginType,
        },
      });
    }

    const newUser = new User({
      name,
      email,
      picture,
      loginType: "google",
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    newUser.accessToken = accessToken;
    newUser.refreshToken = refreshToken;
    await newUser.save();

    return res.json({
      accessToken,
      refreshToken,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        picture: newUser.picture,
        loginType: newUser.loginType,
      },
    });
  } catch (err) {
    console.error(
      "Failed to verify token with Google:",
      err.response?.data || err.message
    );
    res.status(401).json({ error: "Invalid access token" });
  }
};
