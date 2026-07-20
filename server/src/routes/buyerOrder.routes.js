import express from "express"
import { authMiddleware } from "../middlewares/user.middleware.js"
import {
    orderCreateController,
    getAllOrderController,
    getDetailOrderController,
    deleteOrderController,
    requestOrderController,
    reviewOrderController
} from "../controllers/buyerOrder.controller.js"

const router = express.Router()

router.post("/", authMiddleware, orderCreateController)

router.get("/", authMiddleware, getAllOrderController)

router.get("/:orderid", authMiddleware, getDetailOrderController)

router.patch("/:orderid/cancel", authMiddleware, deleteOrderController)

router.post("/:orderid/return", authMiddleware, requestOrderController)

router.post("/:orderid/review", authMiddleware, reviewOrderController)

export default router