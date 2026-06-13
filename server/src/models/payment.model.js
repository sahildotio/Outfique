import mongoose from "mongoose"
import priceSchema from "./price.schema.js"

const paymentSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    price: {
        type: priceSchema,
        required: true
    },
    razorpay: {
        orderId: String,
        paymentId: String,
        signature: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    order: [
        {
            title: String,
            productId: mongoose.Schema.Types.ObjectId,
            variantId: mongoose.Schema.Types.ObjectId,
            quantity: Number,
            productImages: [{ url: String }],
            price: priceSchema,
            description: String
        }
    ],
    orderStatus: {
        type: String,
        enum: [
            "Processing",
            "Packed",
            "Shipped",
            "Delivered",
            "Cancelled"
        ],
    }
},{timestamps: true})

const payments = mongoose.model("payment", paymentSchema)
export default payments