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
      of: Schema.Types.Mixed,
    },

    price: {
      type: priceSchema,
      required: true,
    },

    color: {
      type: String,
    }
  },
  { _id: true },
);

export default variantSchema