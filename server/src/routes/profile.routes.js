import express from "express"
import { authMiddleware } from "../middlewares/user.middleware.js"
import {createProfileController, getProfileController, updateAvatarController, updateProfileController, deleteProfileController, deleteAvatarController} from "../controllers/profile.controller.js"
import multer from "multer"

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/", authMiddleware, upload.single("avatar"), createProfileController)
router.get("/", authMiddleware, getProfileController)
router.patch("/", authMiddleware, updateProfileController)
router.delete("/", authMiddleware, deleteProfileController)
router.patch(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  updateAvatarController,
);
router.patch("/avatar", authMiddleware, deleteAvatarController)

export default router