import mongoose from "mongoose";
import { orderItemSchema } from "./orderItem.Schema.js";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
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
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RETURN_REQUESTED",
        "RETURNED",
      ],
      default: "PENDING",
    },
    request: {
      type: {
        type: String,
        enum: ["CANCEL", "RETURN", "EXCHANGE"],
      },
      reason: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
      },
      requestedAt: Date,
      reviewedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
    },
    tracking: {
      courier: String,
      trackingNumber: String,
      trackingUrl: String,
      shippedAt: Date,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: Date,
    cancelReason: String,
    notes: String,
    returnedAt: Date,
    statusHistory: [
      {
        status: {
          type: String,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],
  },
  { timestamps: true },
);

orderSchema.pre("save", async function () {
  if (!this.estimatedDeliveryDate) {
    const date = new Date();
    date.setDate(date.getDate() + 7);

    this.estimatedDeliveryDate = date;
  }
});

const orders = mongoose.model("order", orderSchema);
export default orders;
