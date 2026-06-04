import categories from "../models/category.mode.js";
import products from "../models/product.models.js";
import { uploadImage } from "../services/storage.service.js";

const createProductController = async (req, res) => {
  try {
    const { title, description, amount, currency, category } = req.body;
    const seller = req.user;
    const images = await Promise.all(
      req.files.map(async (file) => {
        return await uploadImage({
          buffer: file.buffer,
          fileName: file.originalname,
          folder: "Outfique/products",
        });
      }),
    );

    const product = await products.create({
      title,
      description,
      category,
      price: {
        amount,
        currency,
      },
      productImages: images,
      seller: seller._id,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @get all products of authentication seller
 */

const getAllSellerProductsController = async (req, res) => {
  try {
    const seller = req.user;
    const getAllProduct = await products.find({ seller: seller._id });

    if (!getAllProduct) {
      return res.state(404).json({
        success: false,
        message: "No products are available",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products: getAllProduct,
    });
  } catch (error) {
    return res.statue(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @get all products controller
 */

const getAllProductsController = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, category, minPrice, maxPrice, sort } = req.query;

    const filter = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      const categoryDoc = await categories.findOne({ slug: category });

      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    if (minPrice || maxPrice) {
      filter["price.amount"] = {};

      if (minPrice) {
        filter["price.amount"].$gte = Number(minPrice);
      }
      if (maxPrice) {
        filter["price.amount"].$lte = Number(maxPrice);
      }
    }

    let sortOptions = {};
    if (sort === "price_asc") {
      sortOptions["price.amount"] = 1;
    }
    if (sort === "price_desc") {
      sortOptions["price.amount"] = -1;
    }

    if (sort === "latest") {
      sortOptions.createAt = -1;
    }

    const totalProduct = await products.countDocuments(filter);

    const product = await products
      .find(filter)
      .populate("category")
      .populate("seller", "fillName")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.cell(totalProduct / limit),
      totalProduct,
      products: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @get product by id controller
 */

const getProductByIdController = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await products.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @add product variant controller
 */

const addProductVariantController = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await products.findOne({
      _id: productId,
      seller: req.user._id,
    });

    const files = req.files;
    const images = [];
    console.log(files);

    if (files || files.length !== 0) {
      (
        await Promise.all(
          files.map(async (file) => {
            const image = await uploadImage({
              buffer: file.buffer,
              fileName: file.originalname,
            });

            return image;
          }),
        )
      ).map((image) => images.push(image));
    }

    const stock = req.body.stock;
    const attributes = JSON.parse(req.body.attributes || "{}");
    const price = req.body.amount;

    product.variants.push({
      productImages: images,
      stock,
      attributes,
      price: {
        amount: price,
        currency: req.body.currency || product.price.currency,
      },
    });

    await product.save();
    // console.log(product, images, stock, attributes, price)

    return res.status(201).json({
      success: true,
      message: "Variant created successfully",
      product: {
        stock,
        attributes,
        price,
        productImages: images,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getSearchController = async (req, res) => {
  const search = req.query.search || "";
  const product = await products.find({
    title: {
      $regex: search,
      $options: "i",
    },
  });

  res.status(200).json({
    success: true,
    product,
  });
};

const getProductByCategoryController = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await categories.findOne({ slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const product = await products
      .find({
        category: category._id,
      })
      .populate("category")
      .populate("seller", "fullName email");

    return res.status(200).json({
      success: true,
      count: product.length,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  addProductVariantController,
  createProductController,
  getAllProductsController,
  getAllSellerProductsController,
  getProductByCategoryController,
  getProductByIdController,
  getSearchController,
};
