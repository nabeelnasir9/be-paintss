const mongoose = require("mongoose");

const frameSchema = new mongoose.Schema({
  style: { type: String, required: false },
  selected: { type: Boolean, required: true },
});

const imageSchema = new mongoose.Schema({
  uri: { type: String, required: true },
  size: { type: String, required: true },
  frame: frameSchema,
});

const orderSchema = new mongoose.Schema({
  trackingId: { type: String, required: true },
  mysteryPaintKit: { type: String },
  warranty: { type: Boolean, required: true },
  images: [imageSchema],
  sessionId: { type: String, required: true },
  lineItems: { type: Object, required: true }, // Keep it simple as it’s managed by Stripe
  delivery_status: { type: String, required: true },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
