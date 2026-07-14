import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true
            },
            variantId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: `product.variants`,
                required: true
            },
            size: {
                type: String,
                required: true
            },
            price: {
                type: priceSchema
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, "Quantity can not be less then 1"]
            }
        }
    ]
})

const carts = mongoose.model("cart", cartSchema);
export default carts