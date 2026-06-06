import express from "express"
import {sellerMiddleware} from "../middlewares/user.middleware.js"
import {
  createProductController,
  getAllProductsController,
  getAllSellerProductsController,
  getProductByIdController,
  addProductVariantController,
  getSearchController,
} from "../controllers/product.controller.js";
import multer from "multer"
import { createProductValidator } from "../validators/product.validator.js"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

const router = express.Router()

/**
 * @Create product api
 * @POST
 */
router.post("/", sellerMiddleware, upload.array("productImages", 7),createProductValidator, createProductController)

/**
 * @Get All products of authentication seller
 * @GET
 */
router.get("/seller", sellerMiddleware, getAllSellerProductsController)

/**
 * @GET method
 * @desc = get all the items
 */

router.get("/product/search", getSearchController)

/**
 * @Get all products
 */
router.get("/", getAllProductsController)

/**
 * @Get product by id
 * @GET
 */
router.get("/details/:productId", getProductByIdController)

/**
 * @Add product variant
 * @Routes POST -> /:productId/variants
 */

router.post(
  "/:productId/variants",
  sellerMiddleware,
  upload.array("productImages", 7),
  addProductVariantController,
);

export default router