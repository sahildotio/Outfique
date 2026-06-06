import express from "express"
import {
  createCategoryController,
  getAllCategoryController,
  getAllProductByCategorySlugController,
} from "../controllers/category.controller.js";
import { authMiddleware, sellerMiddleware } from "../middlewares/user.middleware.js";
import multer from "multer"

const router = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

router.post("/", sellerMiddleware, upload.single("image"),createCategoryController)
router.get("/", getAllCategoryController)
router.get("/:slug", getAllProductByCategorySlugController)

export default router