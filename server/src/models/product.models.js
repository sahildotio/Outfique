import mongoose, {Schema} from "mongoose"
import priceSchema from "./price.schema.js"
import variantSchema from "./variants.schema.js";
import slugify from "slugify";

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
      required: true,
    },
    price: {
      type: priceSchema,
      required: true,
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
      required: true,
    },
    productSlug: {
      type: String,
      unique: true,
    },
    shipping: {
      estimatedDeliveryDays: {
        type: Number,
        default: 5,
        min: 1
      },
    },
  },
  {
    timestamps: true,
  },
);


productSchema.pre("save", function () {
  if (this.isModified("title")) {
    this.productSlug = slugify(this.title, {
      strict: true,
      lower: true,
      trim: true,
    })
  }
})

productSchema.index({title: "text", description: "text"})

productSchema.virtual("totalStock").get(function () {
  return this.variants.reduce((total, variant)=> total + variant.stock)
})

const products = mongoose.model("product", productSchema)
export default products