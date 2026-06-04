import {Router} from "express"
import { validateRegister, validatorLoginUser } from "../validators/auth.validator.js"
import {
  userRegisterController,
  userLoginController,
  googleSuccessController,
  getMeController,
  logoutController,
} from "../controllers/auth.controller.js";
import passport from "passport";
import configure from "../config/config.js"
import { authMiddleware } from "../middlewares/user.middleware.js";

const router = Router()

/**
 * @Register_Routes
 * @POST
 */
router.post("/register", validateRegister, userRegisterController);

/**
 * @Login_Routes
 * @POST 
 */

router.post("/login", validatorLoginUser, userLoginController);

/**
 * @Google_Auth_Routes
 * @GET
 */
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}))

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: configure.NODE_ENV === "development" ? "http://localhost:5173/auth/user/login" : "/login" }),
  googleSuccessController
)

/**
 * @Me_Routes  
 * @GET
 */

router.get("/me", authMiddleware, getMeController)

/**
 * @Logout_Routes
 * @POST
 */

router.post("/logout", authMiddleware, logoutController)

export default router
