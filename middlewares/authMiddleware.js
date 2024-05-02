const User = require("../models/user");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();

exports.userVerification = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false, message: "No token provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
    if (err) {
      return res.json({ status: false, message: "Token verification failed" });
    } else {
      const user = await User.findById(data.id);
      if (user) {
        return res.json({
          status: true,
          username: user.username,
          id: user._id,
        });
      } else {
        return res.json({ status: false, message: "User not found" });
      }
    }
  });
};
