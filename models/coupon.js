const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  valid: { type: Boolean, default: true },
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
