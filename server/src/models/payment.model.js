import mongoose from "mongoose"
import priceSchema from "./price.schema.js"

const paymentSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ["PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"],
        default: "PENDING",
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
        ref: "user",
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
        required: true
    }
},{timestamps: true})

const payments = mongoose.model("payment", paymentSchema)
export default payments