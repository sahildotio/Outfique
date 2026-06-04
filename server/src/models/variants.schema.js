import { Schema } from "mongoose";
import priceSchema from "./price.schema.js";

const variantSchema = new Schema(
  {
    productImages: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    attributes: {
      type: Map,
      of: String,
    },

    price: {
      type: priceSchema,
      required: true,
    },
  },
  { _id: true },
);

export default variantSchema