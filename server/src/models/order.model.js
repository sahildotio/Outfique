import mongoose from "mongoose";
import { orderItemSchema } from "./orderItem.Schema.js";

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  subTotal: Number,
  shippingCharge: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "RAZORPAY"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"],
    default: "PENDING",
    },
  orderStatus: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED"],
        default: "PENDING"
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "payment"
    },
    trackingNumber: String,
    delivered: Date,
    cancelledAt: Date,
    cancelReason: String,
    notes: String
}, {timestamps: true});

const orders = mongoose.model("order", orderSchema)
export default orders