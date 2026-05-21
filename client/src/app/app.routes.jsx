import {createBrowserRouter} from "react-router"
import Register from "../features/auth/pages/Register"
import Login from "../features/auth/pages/Login"
import CreateProduct from "../features/products/pages/CreateProduct"
import Dashboard from "../features/products/pages/Dashboard"
import Protected from "../features/auth/components/Protected"
import Home from "../features/products/pages/Home"
import ProductDetail from "../features/products/pages/ProductDetail"
import SellerProductDetail from "../features/products/pages/SellerProductDetail"
import Cart from "../features/cart/pages/Cart"
import AppLayout from "./AppLayout"
import OrderSuccess from "../features/cart/pages/OrderSuccess"
import Orders from "../features/cart/pages/Orders"
import OrderDetails from "../features/cart/pages/OrderDetails"
import NotFound from "./NotFound"
import CreateProfile from "../features/profile/page/CreateProfile"
import Profile from "../features/profile/page/Profile"

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
        path: "/product/:productId",
        element: <ProductDetail />,
      },
      {
        path: "/cart",
        element: (
          <Protected>
            <Cart />
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
        path: "/view-orders",
        element: (
          <Protected>
            <Orders />
          </Protected>
        ),
      },
      {
        path: "/orders/:orderDetailId",
        element: (
          <Protected>
            <OrderDetails />
          </Protected>
        ),
      },
      {
        path: "/user/profile",
        element: (
          <Protected><Profile/></Protected>
        )
      },
      {
        path: "/create-profile/:userid",
        element: (<Protected><CreateProfile/></Protected>)
      }
    ],
  },
  {
    path: "*",
    element: <NotFound/>,
  }
]);