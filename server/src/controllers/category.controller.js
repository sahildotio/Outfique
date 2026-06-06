import categories from "../models/category.model.js";
import products from "../models/product.models.js";
import { uploadImage } from "../services/storage.service.js";

const createCategoryController = async (req, res) => {
  const { name } = req.body;
  const exists = await categories.findOne({ name })

  if (exists) {
    return res.status(400).json({
      success: false,
      message: "Category already exists",
    });
  }

  const image = await uploadImage({
    buffer: req.file.buffer,
    fileName: req.file.originalname,
    folder: "Outfique/categories",
  });

  const category = await categories.create({ name, image });
  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
};

const getAllCategoryController = async (req, res) => {
  try {
    const category = await categories.find().sort({ name: 1 });
    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllProductByCategorySlugController = async (req, res) => {
  try {
     const slug = req.params.slug;
     const category = await categories.findOne({slug});
     if (!category)
       return res
         .status(404)
         .json({ success: false, message: "Category not found" });

     const categoryProduct = await products.find({category: category._id}).populate("category")
     return res.status(200).json({
       success: true,
       products: categoryProduct,
     })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export {
  createCategoryController,
  getAllCategoryController,
  getAllProductByCategorySlugController,
};
