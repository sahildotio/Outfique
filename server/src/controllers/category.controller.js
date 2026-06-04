import categories from "../models/category.mode.js";

const createCategoryController = async (req, res) => {
    const { name } = req.body;
  const exists = await categories.find({ name });
  if (!exists) {
    return res.status(400).json({
      success: false,
      message: "Category already exists",
    });
  }

  const category = await categories.create({ name });
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

export { createCategoryController, getAllCategoryController };
