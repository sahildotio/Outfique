import mongoose from "mongoose"

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    fullName: String,

    contact: String,

    houseNo: String,

    street: String,

    landmark: String,

    city: String,

    state: String,

    country: {
      type: String,
      default: "India",
    },

    pincode: String,

    addressType: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const profileModel = mongoose.model("profile", profileSchema)
export default profileModel