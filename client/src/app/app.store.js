import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/state/auth.slice"
import productReducer from "../features/products/state/product.slice.js"
import cartReducers from "../features/cart/state/cart.slice.js"
import profileReducer from "../features/profile/state/profile.slice.js";
import wishlistReducer from "../features/wishlist/state/wishlist.state.js"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducers,
        profile: profileReducer,
        wishlist: wishlistReducer,
    }
})
