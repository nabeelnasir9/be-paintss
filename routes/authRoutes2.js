const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { userVerification } = require("../middlewares/authMiddleware");
const { createSecretToken } = require("../utils/secretToken");
const User = require("../models/user");
require("dotenv").config();

router.post("/", userVerification);
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    try {
      const newUser = await User.create({ email, password, fullName });
      const token = createSecretToken(User._id);
      res.cookie("token", token, {
        withCredentials: true,
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
      console.log(token);
      res
        .status(200)
        .json({ message: "User created successfully", success: true, newUser });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.username === 1) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      throw error;
    }
  } catch (error) {
    console.log(error);
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const checkPassword = await bcrypt.compare(password, checkUser.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Password is incorrect" });
    }
    const token = createSecretToken(checkUser._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: true,
      sameSite: "None", // "strict
      secure: true,
    });
    console.log(token);
    res.status(200).json({
      message: "User Logged in successfully",
      success: true,
      cookie: req.cookies,
    });
  } catch (error) {
    console.log(error);
  }
});
router.post("/logout", async (req, res, next) => {
  try {
    res.clearCookie("token");
    res
      .status(200)
      .json({ message: "User Logged out successfully", success: true });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
