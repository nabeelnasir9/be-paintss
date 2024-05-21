const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  trackingId: { type: String },
  sessionId: { type: String, required: true },
  lineItems: { type: Array, required: true },
  shipping: { type: Object },
  delivery_status: { type: String },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
