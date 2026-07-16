import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: Number,
    required: true,
    trim: true,
  },
  alternatePhone: {
    type: String,
    trim: true,
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
  },
  landmark: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    default: "India",
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  addressType: {
    type: String,
    enum: ["HOME", "WORK", "OTHER"],
    default: "HOME",
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const addressModel = mongoose.model("address", addressSchema);
export default addressModel;
