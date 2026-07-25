import express from "express"
import { authMiddleware } from "../middlewares/user.middleware.js"
import {
    getAllOrderController,
    getDetailOrderController,
    deleteOrderController,
    requestOrderController,
    reviewOrderController
} from "../controllers/buyerOrder.controller.js"

const router = express.Router()

router.get("/", authMiddleware, getAllOrderController)

router.get("/:orderid", authMiddleware, getDetailOrderController)

router.patch("/:orderid/cancel", authMiddleware, deleteOrderController)

router.patch("/:orderid/return", authMiddleware, requestOrderController)

router.post("/:orderid/review", authMiddleware, reviewOrderController)

export default router