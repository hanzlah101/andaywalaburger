import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import { connectPassport } from "./utils/provider.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
connectPassport();

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to DB.");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.enable("trust proxy");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,

    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    },
  })
);
app.use(cookieParser());
app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    credentials: true,
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is working on PORT ${PORT}`));
