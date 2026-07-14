import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import configure from "../config/config.js";
import { getCartByUserId } from "../dao/cart.dao.js";
import { stockVariant } from "../dao/product.dao.js";
import carts from "../models/cart.models.js";
import payments from "../models/payment.model.js";
import products from "../models/product.models.js";
import { createOrder } from "../services/payment.service.js";

const addToCartController = async (req, res) => {
 
    const { productId, variantId } = req.params;
    const { quantity, size } = req.body;

    const product = await products.findOne({
      _id: productId,
      "variants._id": variantId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const stock = await stockVariant(productId, variantId);

    let cart = await carts.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await carts.create({
        user: req.user._id,
        items: [],
      });
    }

    const isProductAlreadyInCart = cart.items.find(
      (item) =>
        item.product?.toString() === productId &&
        item.variant?.toString() === variantId,
    );

    if (isProductAlreadyInCart) {
      const quantityInCart = cart.items.find(
        (item) =>
          item.product.toString() === productId &&
          item.variant.toString() === variantId,
      );

      if (quantityInCart + quantity > stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${stock} items left in stock and you already have ${quantityInCart} in cart`,
        });
      }

      await carts.findOneAndUpdate(
        {
          user: req.user._id,
          "items.productId": productId,
          "items.variantId": variantId,
        },
        {
          $inc: { "items.$.quantity": quantity },
        },
        {
          new: true,
        },
      );

      return res.status(200).json({
        success: true,
        message: "Product updated in cart",
        cart,
      });
    }

    if (quantity > stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${stock} items left in stock`,
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId &&
        item.size === size,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        variantId,
        quantity,
        size,
        price: product.variants.find(
          (variant) => variant._id.toString() === variantId,
        ).price,
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
 
};

const getAllCartController = async (req, res) => {
  const user = req.user;

  let cart = await getCartByUserId(user._id);

  if (!cart) {
    cart = await carts.create({ user: req.user._id });
  }
  return res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    cart,
  });
};

const incrementQuantityController = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const product = await products.findOne({
      _id: productId,
      "variants._id": variantId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const cart = await carts.findOne({
      user: req.user._id,
      "items.productId": productId,
      "items.variantId": variantId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    const stock = await stockVariant(productId, variantId);

    const itemQuantityInCart = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId,
    ).quantity;

    if (itemQuantityInCart + 1 > stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${stock} items left in stock and you already have ${itemQuantityInCart} in cart`,
      });
    }

    await carts.findOneAndUpdate(
      {
        user: req.user._id,
        "items.productId": productId,
        "items.variantId": variantId,
      },
      {
        $inc: {
          "items.$.quantity": 1,
        },
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Quantity incremented successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const decrementQuantityController = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const product = await products.findOne({
      _id: productId,
      "variants._id": variantId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const cart = await carts.findOne({
      user: req.user._id,
      "items.productId": productId,
      "items.variantId": variantId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    const itemQuantityInCart = cart.items.find(
      (item) =>
        item.productId?.toString() === productId &&
        item.variantId?.toString() === variantId,
    ).quantity;

    if (!itemQuantityInCart) {
      return res.status(400).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    if (itemQuantityInCart <= 1) {
      return res.status(400).json({
        success: false,
        message: "Minimum quantity is 1",
      });
    }

    await carts.findOneAndUpdate(
      {
        user: req.user._id,
        "items.productId": productId,
        "items.variantId": variantId,
      },
      {
        $inc: {
          "items.$.quantity": -1,
        },
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Quantity decremented successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteQuantityController = async (req, res) => {
  const { productId, variantId } = req.params;

  const cart = await carts.findOne({
    user: req.user._id,
    "items.productId": productId,
    "items.variantId": variantId,
  });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Product not found in cart",
    });
  }

  await carts.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        items: {
          productId,
          variantId,
        },
      },
    },
  );

  return res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
  });
};

const createOrderController = async (req, res) => {
  const cart = await getCartByUserId(req.user._id);

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const order = await createOrder({
    amount: cart.totalPrice,
    currency: cart.currency,
  });

  const paymentDets = await payments.create({
    user: req.user._id,
    razorpay: {
      orderId: order.id,
    },
    price: {
      amount: cart.totalPrice,
      currency: cart.currency,
    },
    orderItems: cart.items.map((item) => {
      return {
        title: item.productId?.title,
        productId: item.productId?._id,
        variantId: item.variantId,
        quantity: item.quantity,
        Image: item.productId?.productImages[0]?.url,
        price: {
          amount:
            item.productId.variants.price.amount || item.product.price.amount,
          currency:
            item.productId.variants.price.currency ||
            item.product.price.currency,
        },
        description: item.productId?.description,
      };
    }),
    orderStatus: "Processing",
  });

  return res.status(200).json({
    success: true,
    message: "Order created successfully",
    order,
    paymentDets,
  });
};

const verifyOrderPaymentController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const payment = await payments.findOne({
      "razorpay.orderId": razorpay_order_id,
      status: "pending",
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const isPaymentValid = validatePaymentVerification(
      {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      },
      razorpay_signature,
      configure.RAZORPAY_KEY_SECRET,
    );

    if (!isPaymentValid) {
      payment.status = "failed";
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    payment.status = "completed";
    payment.razorpay.paymentId = razorpay_payment_id;
    payment.razorpay.signature = razorpay_signature;

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  addToCartController,
  createOrderController,
  decrementQuantityController,
  deleteQuantityController,
  getAllCartController,
  incrementQuantityController,
  verifyOrderPaymentController,
};
