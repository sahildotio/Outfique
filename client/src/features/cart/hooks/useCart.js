import { useDispatch } from "react-redux";
import {
  addToCart,
  createCartOrder,
  decrementCartItems,
  deleteCartItems,
  getAllCartItems,
  incrementCartItems,
  verifyCartOrderPayment,
} from "../service/cart.api";
import {
  addItems,
  decrementItems,
  deleteItems,
  incrementItems,
} from "../state/cart.slice";

export const useCart = () => {
  const dispatch = useDispatch();

  const handleAddToCart = async ({ productId, variantId, size }) => {
    const data = await addToCart({ productId, variantId, size });
    dispatch(addItems(data.cart));
    return data.cart;
  };

  const handleGetAllAddToCart = async () => {
    const data = await getAllCartItems();
    dispatch(addItems(data.cart));
    return data.cart;
  };

  const handleIncrementItems = async ({ productId, variantId }) => {
    await incrementCartItems({ productId, variantId });
    dispatch(incrementItems({ productId, variantId }));
  };

  const handleDecrementItems = async ({ productId, variantId }) => {
    await decrementCartItems({ productId, variantId });
    dispatch(decrementItems({ productId, variantId }));
  };

  const handleDeleteItems = async ({ productId, variantId }) => {
    await deleteCartItems({ productId, variantId });
    dispatch(deleteItems({ productId, variantId }));
  };

  const handleAddToCartOrder = async ({shippingAddress}) => {
    const order = await createCartOrder({shippingAddress});
    return order;
  };

  const handleVerifyCartOrderPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) => {
    const data = await verifyCartOrderPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return data;
  };
  return {
    handleAddToCart,
    handleGetAllAddToCart,
    handleIncrementItems,
    handleDecrementItems,
    handleDeleteItems,
    handleAddToCartOrder,
    handleVerifyCartOrderPayment,
  };
};
