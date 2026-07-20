import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors"
import passport from 'passport'
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import configure from "./config/config.js";
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.routes.js"
import profileRoutes from "./routes/profile.routes.js"
import wishlistRoutes from "./routes/wishlist.routes.js"
import categoryRoutes from "./routes/category.routes.js"
import addressRoutes from "./routes/address.routes.js"
import buyerOrderRoutes from "./routes/buyerOrder.routes.js"
import sellerOrderRoutes from "./routes/sellerOrder.routes.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}))

app.use(passport.initialize())
passport.use(
  new GoogleStrategy({
    clientID: configure.GOOGLE_CLIENT_ID,
    clientSecret: configure.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",

  }, (_, __, profile, done) => {
      return done(null, profile)
  }),
);

/**
 * @AuthRoutes
 */
app.use("/api/auth", authRoutes);
/**
 * @ProductRoutes
 */
app.use("/api/products", productRoutes)

/**
 * @CartRoutes
 */

app.use("/api/cart", cartRoutes)

/**
 * @profileRoutes
 */

app.use("/api/profile", profileRoutes)

/**
 * @wishlistRoutes
 */
app.use("/api/wishlist", wishlistRoutes)
/**
 * @CategoryRoutes
 */

app.use("/api/category", categoryRoutes)
/**
 * @addressRoutes
 */

app.use("/api/address", addressRoutes)
/**
 * @order_management
 * @Buyer Order
 */

app.use("/api/buyer/order", buyerOrderRoutes)

/**
 * @order_management
 * @Seller order
 */

app.use("/api/seller/order", sellerOrderRoutes)

export default app;