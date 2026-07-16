import express from "express"
import { authMiddleware } from "../middlewares/user.middleware.js"
import { createAddressController } from "../controllers/address.controller.js"

const router = express.Router()

router.post("/", authMiddleware, createAddressController)

export default router