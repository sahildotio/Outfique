import mongoose from "mongoose"
import slugify from "slugify"

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        unique: true,
    },
    image: {
        url: String
    }
}, {timestamps: true})

categorySchema.pre("save", function () {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            trim: true
        })
    }
})

const categories = mongoose.model("category", categorySchema)

export default categories