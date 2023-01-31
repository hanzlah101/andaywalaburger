import express from "express";
import passport from "passport";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import { asyncError } from "../middlewares/errorMiddleware.js";
import { User } from "../models/userModels.js";
import { Order } from "../models/orderModels.js";

const router = express.Router();

router.get(
  "/google/auth",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

// AUTH USER

router.get(
  "/login",
  passport.authenticate("google", {
    scope: ["profile"],
    successRedirect: process.env.FRONTEND_URL,
  }),

  (req, res) => {
    res.send("Logged in successfully!");
  }
);

// MY USER INFO

router.get("/me", isAuthenticated, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// LOGOUT USER

router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    else {
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully!" });
    }
  });
});

// GET ALL USERS

router.get(
  "/all",
  isAuthenticated,
  isAdmin,
  asyncError(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({ success: true, users });
  })
);

// GET ADMIN STATS

router.get(
  "/admin/stats",
  isAuthenticated,
  isAdmin,
  asyncError(async (req, res, next) => {
    const usersCount = await User.countDocuments();
    const orders = await Order.find();

    const preparingOrders = orders.filter((i) => i.orderStatus === "Preparing");
    const shippedOrders = orders.filter((i) => i.orderStatus === "Shipped");
    const deliveredOrders = orders.filter((i) => i.orderStatus === "Delivered");

    let totalIncome = 0;

    orders.forEach((i) => {
      totalIncome = totalIncome + i.totalAmount;
    });

    res.status(200).json({
      success: true,
      usersCount,
      ordersCount: {
        total: orders.length,
        preparing: preparingOrders.length,
        shipped: shippedOrders.length,
        delivered: deliveredOrders.length,
      },
      totalIncome,
    });
  })
);

export default router;
