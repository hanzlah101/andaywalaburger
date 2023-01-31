import express from "express";
import passport from "passport";
import Stripe from "stripe";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import { asyncError } from "../middlewares/errorMiddleware.js";
import { Order } from "../models/orderModels.js";
import errorHandler from "../utils/errorHandler.js";

const router = express.Router();

// CREATE ORDER COD

router.post(
  "/create/cod",
  isAuthenticated,
  asyncError(async (req, res, next) => {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      itemsPrice,
      shippingCharges,
      taxPrice,
      totalAmount,
    } = req.body;

    const user = "req.user._id";

    const orderOptions = {
      shippingInfo,
      orderItems,
      paymentMethod,
      itemsPrice,
      shippingCharges,
      taxPrice,
      totalAmount,
      user,
    };

    await Order.create(orderOptions);

    res.status(201).json({
      success: true,
      message: "Order Placed Successfully via Cash On Delivery.",
    });
  })
);

// CREATE ORDER ONLINE

router.post(
  "/payment/online",
  isAuthenticated,
  asyncError(async (req, res, next) => {
    const stripe = new Stripe(process.env.STRIPE_KEY);

    stripe.charges.create(
      {
        source: req.body.tokenId,
        amount: req.body.amount,
        currency: "usd",
      },
      (stripeErr, stripeRes) => {
        if (stripeErr) {
          res.status(500).json(stripeErr);
        } else {
          res.status(200).json(stripeRes);
        }
      }
    );
  })
);

// GET MY ORDERS

router.get(
  "/my",
  isAuthenticated,
  asyncError(async (req, res, next) => {
    const orders = await Order.find({
      user: req.user._id,
    }).populate("user", "name");

    res.status(200).json({
      success: true,
      orders,
    });
  })
);

// GET ORDER DETAILS

router.get(
  "/details/:id",
  asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name");

    if (!order) return next(new errorHandler("Invalid Order Id", 404));

    res.status(200).json({
      success: true,
      order,
    });
  })
);

// GET ALL ORDERS -- ADMIN

router.get(
  "/all",
  isAuthenticated,
  isAdmin,
  asyncError(async (req, res, next) => {
    const orders = await Order.find().populate("user", "name");

    res.status(200).json({
      success: true,
      orders,
    });
  })
);

// CHANGE ORDER STATUS -- ADMIN

router.get(
  "/status/:id",
  isAuthenticated,
  isAdmin,
  asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) return next(new errorHandler("Invalid Order Id", 404));

    if (order.orderStatus === "Preparing") order.orderStatus = "Shipped";
    else if (order.orderStatus === "Shipped") {
      order.orderStatus = "Delivered";
      order.deliveredAt = Date.now();
    } else if (order.orderStatus === "Delivered") {
      return next(new errorHandler("Already Delivered!", 404));
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Status Updated Successfully!",
    });
  })
);

export default router;
