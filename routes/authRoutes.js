const express = require("express");
const Order = require("../models/order");
const Stripe = require("stripe");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);
const router = express.Router();

router.post("/payment", async (req, res) => {
  const { images } = req.body;
  const lineItems = images.map((index) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: "Generative Images",
        images: [index],
      },
      unit_amount: 6000,
    },
    quantity: "1",
  }));
  try {
    const trackingId = uuidv4();
    const successUrl = `${process.env.ORIGIN}/success?trackingId=${trackingId}`;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["IN", "US", "CA"],
      },
      success_url: successUrl,
      cancel_url: `${process.env.ORIGIN}/cancel`,
    });

    const order = new Order({
      trackingId: trackingId,
      sessionId: session.id,
      lineItems: lineItems,
      delivery_status: "Expected",
    });
    await order.save();

    res.json({
      id: session.id,
      url: session.url,
      trackingId: order.trackingId,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

router.get("/order/:trackingId", async (req, res) => {
  const { trackingId } = req.params;
  try {
    const order = await Order.findOne({ trackingId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

module.exports = router;
