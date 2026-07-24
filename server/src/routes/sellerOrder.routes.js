import express from "express"
import { sellerMiddleware } from "../middlewares/user.middleware.js"
import {
  getSellerDetailOrderController,
  getSellerOrderController,
  updateStatusOrderController,
  trackingOrderController,
  reviewOrderController,
} from "../controllers/sellerOrder.controller.js";

const router = express.Router()

router.get("/", sellerMiddleware, getSellerOrderController)

router.get("/:orderid", sellerMiddleware, getSellerDetailOrderController)


router.patch("/:orderid/status", sellerMiddleware, updateStatusOrderController)

router.patch("/:orderid/tracking", sellerMiddleware, trackingOrderController)

router.patch("/:orderid/return", sellerMiddleware, reviewOrderController)

export default router