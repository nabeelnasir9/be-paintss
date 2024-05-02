const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();

exports.createSecretToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "70d",
  });
};
