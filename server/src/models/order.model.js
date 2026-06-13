import mongoose from "mongoose"
import priceSchema from "./price.schema"

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    items: [
        {
            seller: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
                required: true
            },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true
            },
            variantId: {
                type: mongoose.Schema.Types.ObjectId,
            },
            title: {
                type: String,
                required: true
            },
            description: true,
            productImages: [
                {
                    url: String
                }
            ],
            quantity: {
                type: Number,
                required: true,

            },
            price: {
                type: priceSchema,
                required: true
            },
            status: {
                type: String,
                enum: [
                    "Processing",
                    "Packed",
                    "Shipped",
                    "Delivered",
                    "Cancelled"
                ],
                default: "Processing"
            }
        }
    ],
    totalPrice: {
        type: priceSchema,
        required: true
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "profile"
    }
}, {timestamps: true})

const orders = mongoose.model("order", orderSchema)
export default orders