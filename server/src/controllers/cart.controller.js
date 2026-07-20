import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import configure from "../config/config.js";
import { getCartByUserId } from "../dao/cart.dao.js";
import { stockVariant } from "../dao/product.dao.js";
import addressModel from "../models/address.model.js";
import carts from "../models/cart.models.js";
import orders from "../models/order.model.js";
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

    await carts.findOneAndReplace(
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

    await carts.findOneAndReplace(
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

    await carts.findOneAndReplace(
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

  await carts.findOneAndReplace(
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

  if (!cart || cart.items.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const address = await addressModel.findOne({
    isDefault: true,
    user: req.user._id,
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Please add or select a default address",
    });
  }
  const dbOrder = await orders.create({
    buyer: req.user._id,

    items: cart.items.map((item) => {
      const variant = Array.isArray(item.productId.variants) ? item.productId.variants.find((v) => v._id.equals(item.variantId)) : item.productId.variants

      console.log(variant)
      
      if (!variant) {
        throw new Error("Variant not found")
      }

      return {
        product: item.productId._id,
        seller: item.productId.seller,
        variant: item.variantId,
        size: item.size,
        quantity: item.quantity,
        price: variant.price.amount,
        totalPrice: variant.price.amount * item.quantity,
      };
    }),
    subTotal: cart.totalPrice,
    shippingCharge: 0,
    discount: 0,
    totalAmount: cart.totalPrice,

    paymentMethod: "RAZORPAY",
    paymentStatus: "PENDING",
    orderStatus: "PENDING",
  });

  console.log("Cart Total:", cart.totalPrice);
  console.log("Cart Currency:", cart.currency);

  const razorpayOrder = await createOrder({
    amount: cart.totalPrice,
    currency: cart.currency,
  });
  console.log(razorpayOrder);
  const paymentDets = await payments.create({
    user: req.user._id,
    order: dbOrder._id,
    razorpay: {
      orderId: razorpayOrder.id,
    },
    price: {
      amount: cart.totalPrice,
      currency: cart.currency,
    },
    status: "PENDING",
  });

  dbOrder.payment = paymentDets._id;
  await dbOrder.save();

  return res.status(200).json({
    success: true,
    message: "Order created successfully",
    order: dbOrder,
    razorpayOrder,
    paymentDets,
  });
};

const verifyOrderPaymentController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const payment = await payments.findOne({
      "razorpay.orderId": razorpay_order_id,
      status: "PENDING",
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
      payment.status = "FAILED";

      await payment.save();

      const order = await orders.findById(payment.order);

      if (order) {
        order.paymentStatus = "FAILED";
        order.orderStatus = "CANCELLED";

        await order.save();
      }
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
    const order = await orders.findById(payment.order);

    order.paymentStatus = "PAID";
    order.orderStatus = "CONFIRMED";

    payment.status = "PAID";
    payment.razorpay.paymentId = razorpay_payment_id;
    payment.razorpay.signature = razorpay_signature;

    await payment.save();
    await order.save();

    const cart = await carts.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    for (const item of order.items) {
      const product = await products.findById(item.product);
      if (!product) {
        continue;
      }
      const variant = product.variants.id(item.variant);
      if (!variant) {
        continue;
      }
      variant.stock -= item.quantity;
      await product.save();
    }

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
}

export {
  addToCartController,
  createOrderController,
  decrementQuantityController,
  deleteQuantityController,
  getAllCartController,
  incrementQuantityController,
  verifyOrderPaymentController
}