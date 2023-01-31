import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    photo: String,
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
