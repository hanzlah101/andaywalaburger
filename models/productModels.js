import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: Number,
    name: {
      type: String,
      required: [true, "Please enter product name."],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Please enter product description."],
    },

    price: {
      type: Number,
      required: [true, "Please enter product price."],
      maxLength: [8, "Price cannot exceed 8 digits."],
    },

    images: [
      {
        publicId: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    category: {
      type: String,
      required: [true, "Please provide product category."],
    },

    stock: {
      type: Number,
      required: [true, "Please provide product stock."],
      maxLength: [4, "Stock cannot exceed 4 digits."],
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
