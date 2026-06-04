import mongoose, {Schema} from "mongoose"
import priceSchema from "./price.schema.js"
import variantSchema from "./variants.schema.js";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    price: {
      type: priceSchema,
      required: true
    },
    productImages: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
    variants: [variantSchema],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true
    },
    brand: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"]
    }
  },
  {
    timestamps: true,
  },
);

productSchema.virtual("totalStock").get(function () {
  return this.variants.reduce((total, variant)=> total + variant.stock)
})

const products = mongoose.model("product", productSchema)
export default products