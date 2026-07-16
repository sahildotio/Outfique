import mongoose from "mongoose"

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  avatar: {
    url: String,
    publicId: String,
  },
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address"
    }
  ],
  defaultAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "address"
  },
  wishlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "wishlist"
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cart"
  },
  bio: {
    type: String,
    maxlength: 300
  }
});

const profileModel = mongoose.model("profile", profileSchema)
export default profileModel