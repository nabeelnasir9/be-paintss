const express = require("express");
const Order = require("../models/order");
const Coupon = require("../models/coupon");
const MysteryImage = require("../models/mysteryimage");
const Stripe = require("stripe");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);
const router = express.Router();

router.post("/payment", async (req, res) => {
  const { images, price, couponCode } = req.body;
  const lineItems = {
    price_data: {
      currency: "usd",
      product_data: {
        name: "Generative Images",
        images: images.map((image) => image.uri),
      },
      unit_amount: price,
    },
    quantity: "1",
  };

  try {
    const trackingId = uuidv4();
    const successUrl = `${process.env.ORIGIN}/success?trackingId=${trackingId}`;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [lineItems],
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

    const coupon = await Coupon.findOne({ code: couponCode });
    if (coupon) {
      coupon.valid = false;
      await coupon.save();
    }

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
router.post("/generate", async (req, res) => {
  const { code, discount } = req.body;
  const newCoupon = new Coupon({ code, discount });

  try {
    await newCoupon.save();
    res.status(201).json({ message: "Coupon generated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.post("/validate", async (req, res) => {
  const { code } = req.body;

  try {
    const coupon = await Coupon.findOne({ code, valid: true });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon" });
    }
    res.status(200).json({ discount: coupon.discount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/random", async (req, res) => {
  try {
    const count = await MysteryImage.countDocuments();
    const random = Math.floor(Math.random() * count);
    const image = await MysteryImage.findOne().skip(random);

    res.status(200).json(image);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
