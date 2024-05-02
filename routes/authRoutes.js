const express = require("express");
const User = require("../models/user");
const Order = require("../models/order");
const Stripe = require("stripe");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send("User already exists");
    }
    user = new User({ email, password, fullName });
    await user.save();
    res.status(200).json({ success: "User Created" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json("Invalid Credentials or User not verified");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json("Invalid Credentials");
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            fullName: user.fullName,
            email: user.email,
          },
        });
      },
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/selected", async (req, res) => {
  try {
    const { email, image } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.selectedImages.push(image);
    await user.save();
    res.status(200).json({ success: "Image added successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/confirmed", async (req, res) => {
  try {
    const { email, image } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.selectedImages.push(image);
    await user.save();
    res.status(200).json({ success: "Image added successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/cart", async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const selectedImages = user.selectedImages;
    return res
      .status(200)
      .json({ message: "User found", images: selectedImages });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/check", async (req, res) => {
  try {
    const { email, image } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const urlExists = user.selectedImages.includes(image);

    if (!urlExists) {
      user.selectedImages.push(image);
      await user.save();
    }

    return res.status(200).json({ exists: urlExists });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/payment", async (req, res) => {
  const { images, userEmail } = req.body;

  const lineItems = images.map((index) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: "Tarot Card",
        images: [index],
      },
      unit_amount: 6000,
    },
    quantity: "1",
  }));
  try {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log(process.env.ORIGIN);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["IN", "US", "CA"],
      },
      success_url: `${process.env.ORIGIN}/success`,
      cancel_url: `${process.env.ORIGIN}/cancel`,
    });

    const order = new Order({
      sessionId: session.id,
      userId: user._id,
      lineItems: lineItems,
      delivery_status: "Expected",
    });
    await order.save();
    user.orders.push(order._id);
    await user.save();
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

router.get("/orders", async (req, res) => {
  const { userEmail } = req.query;
  try {
    const user = await User.findOne({ email: userEmail }).populate("orders");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.orders);
  } catch (error) {
    console.error("Error fetching user's orders:", error);
    res.status(500).json({ error: "Failed to fetch user's orders" });
  }
});
module.exports = router;
