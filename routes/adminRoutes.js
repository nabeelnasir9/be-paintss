const express = require("express");
const User = require("../models/user");
const Stripe = require("stripe");
const Order = require("../models/order");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);
const router = express.Router();

router.get("/all-orders", async (_req, res) => {
  try {
    const orders = await Order.find();
    for (const order of orders) {
      try {
        const session = await stripe.checkout.sessions.retrieve(
          order.sessionId,
        );
        order.shipping = session;
        await order.save();
      } catch (error) {
        console.error("Error retrieving session:", error.message);
      }
    }
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

router.get("/orderInfo", async (_req, res) => {
  try {
    const orders = await Order.find();
    let totalAmount = 0;
    let totalItemCount = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    orders.forEach((order) => {
      totalAmount += order.shipping.amount_total;

      order.lineItems.forEach((item) => {
        totalItemCount += parseInt(item.quantity);
      });

      const paymentStatus = order.shipping.payment_status;
      if (paymentStatus === "paid") {
        paidCount++;
      } else if (paymentStatus === "unpaid") {
        unpaidCount++;
      }
    });
    const response = {
      totalAmount,
      totalItemCount,
      paymentStatusCounts: {
        paid: paidCount,
        unpaid: unpaidCount,
      },
    };
    res.json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

/**
 * @classdesc [INFO: Update Status of Order]
 */
router.post("/update-status", async (req, res) => {
  try {
    const { orderId, deliveryStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { delivery_status: deliveryStatus },
      { new: true },
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/order-noti", async (_req, res) => {
  try {
    const allOrders = await Order.find();
    res.status(200).json(allOrders.length);
  } catch (error) {
    console.error("Error retrieving prompts:", error);
    res
      .status(500)
      .json({ message: "Error retrieving prompts from the database" });
  }
});

module.exports = router;
