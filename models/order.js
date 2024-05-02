const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lineItems: { type: Array, required: true },
  shipping: { type: Object },
  delivery_status: { type: String },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
