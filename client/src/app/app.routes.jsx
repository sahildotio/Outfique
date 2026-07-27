import Address from "@/features/address/page/Address";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import ViewAllOrder from "@/features/order/page/Buyer/ViewAllOrder";
import SellerAnalytics from "@/features/order/page/Seller/SellerAnalytics";
import SellerOrder from "@/features/order/page/Seller/SellerOrder";
import SellerOrderDetail from "@/features/order/page/Seller/SellerOrderDetail";
import CategoryWiseProduct from "@/features/products/pages/CategoryWiseProduct";
import { createBrowserRouter } from "react-router";
import Protected from "../features/auth/components/Protected";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Cart from "../features/cart/pages/Cart";
import OrderSuccess from "../features/cart/pages/OrderSuccess";
import CreateProduct from "../features/products/pages/CreateProduct";
import Dashboard from "../features/products/pages/Dashboard";
import Home from "../features/products/pages/Home";
import ProductDetail from "../features/products/pages/ProductDetail";
import SellerProductDetail from "../features/products/pages/SellerProductDetail";
import CreateProfile from "../features/profile/page/CreateProfile";
import Profile from "../features/profile/page/Profile";
import Wishlist from "../features/wishlist/pages/Wishlist";
import AppLayout from "./AppLayout";
import NotFound from "./NotFound";
import BuyerOrderDetail from "@/features/order/page/Buyer/BuyerOrderDetail";

export const router = createBrowserRouter([
  {
    path: "/auth/user/register",
    element: <Register />,
  },
  {
    path: "/auth/user/login",
    element: <Login />,
  },
  {
    path: "/reset/:resetToken",
    element: <ResetPassword />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/seller",
        children: [
          {
            path: "/seller/create-product",
            element: (
              <Protected role="seller">
                <CreateProduct />
              </Protected>
            ),
          },
          {
            path: "/seller/dashboard",
            element: (
              <Protected role="seller">
                <Dashboard />
              </Protected>
            ),
          },
          {
            path: "/seller/analytics",
            element: (
              <Protected role="seller">
                <SellerAnalytics />
              </Protected>
            ),
          },
          {
            path: "/seller/order/:orderid",
            element: (
              <Protected role="seller">
                <SellerOrderDetail />
              </Protected>
            ),
          },
          {
            path: "/seller/orders",
            element: (
              <Protected role="seller">
                <SellerOrder />
              </Protected>
            ),
          },
          {
            path: "/seller/product/:productId",
            element: (
              <Protected role="seller">
                <SellerProductDetail />
              </Protected>
            ),
          },
        ],
      },
      {
        path: "/product/:slug/:productSlug",
        element: <ProductDetail />,
      },
      {
        path: "/checkout/cart",
        element: (
          <Protected>
            <Cart />
          </Protected>
        ),
      },
      {
        path: "/checkout/address/new",
        element: (
          <Protected>
            <Address />
          </Protected>
        ),
      },
      {
        path: "/order/success",
        element: (
          <Protected>
            <OrderSuccess />
          </Protected>
        ),
      },
      {
        path: "/user/profile",
        element: (
          <Protected>
            <Profile />
          </Protected>
        ),
      },
      {
        path: "/view-orders",
        element: (
          <Protected>
            <ViewAllOrder />
          </Protected>
        ),
      },
      {
        path: "/orders/:orderid",
        element: (
          <Protected>
            <BuyerOrderDetail />
          </Protected>  
        )
      },
      {
        path: "/create-profile/:userid",
        element: (
          <Protected>
            <CreateProfile />
          </Protected>
        ),
      },
      {
        path: "/wishlist",
        element: (
          <Protected>
            <Wishlist />
          </Protected>
        ),
      },
      {
        path: "/:slug",
        element: (
          <>
            <Protected>
              <CategoryWiseProduct />
            </Protected>
          </>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
