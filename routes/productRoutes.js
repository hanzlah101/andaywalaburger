import express from "express";
import { Product } from "../models/productModels.js";

const router = express.Router();

// CREATE PRODUCT -- ADMIN

router.post("/new", async (req, res) => {
  const product = await Product.create(req.body);

  try {
    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      savedProduct,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL PRODUCTS

router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;

  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 });
    } else if (qCategory) {
      products = await Product.find({
        category: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE PRODUCT -- ADMIN

router.put("/update/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json(err);
  }
});

// DELETE PRODUCT -- ADMIN

router.delete("/delete/:id", async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json("Product has been deleted...");
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
