import orders from "../models/order.model";

const getSellerOrderController = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      search,
      sort = "-createdAt",
    } = req.query;

    const query = {
      "items.seller": sellerId,
    };

    if (status) {
      query.orderStatus = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        {
          orderNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          "shippingAddress.fullName": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const ordersList = await orders
      .find(query)
      .populate("buyer", "name email contact")
      .populate("items.product", "title slug images")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const sellerOrders = ordersList.map((order) => {
      const obj = order.toObject();

      obj.items = obj.items.filter(
        (item) => item.seller.toString() === sellerId.toString(),
      );

      obj.subTotal = obj.items.reduce((sum, item) => sum + item.totalPrice, 0);

      return obj;
    });

    const totalOrders = await orders.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Seller orders fetched successfully.",
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / Number(limit)),
      totalOrders,
      orders: sellerOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSellerDetailOrderController = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { orderId } = req.params;

    const order = await orders
      .findOne({
        _id: orderId,
        "items.seller": sellerId,
      })
      .populate("buyer", "name email contact")
      .populate("payment")
      .populate("items.product", "title slug images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const orderData = order.toObject();

    orderData.items = orderData.items.filter(
      (item) => item.seller.toString() === sellerId.toString(),
    );

    orderData.subTotal = orderData.items.reduce(
      (total, item) => total + item.totalPrice,
      0,
    );

    return res.status(200).json({
      success: true,
      message: "Order details fetched successfully.",
      order: orderData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStatusOrderController = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      "CONFIRMED",
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "RETURNED",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await orders.findOne({
      _id: orderId,
      "items.seller": sellerId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const workflow = {
      PENDING: "CONFIRMED",
      CONFIRMED: "PROCESSING",
      PROCESSING: "PACKED",
      PACKED: "SHIPPED",
      SHIPPED: "OUT_FOR_DELIVERY",
      OUT_FOR_DELIVERY: "DELIVERED",
      RETURN_REQUESTED: "RETURNED",
    };

    const nextStatus = workflow[order.orderStatus];

    if (nextStatus !== status) {
      return res.status(400).json({
        success: false,
        message: `Order can only move from ${order.orderStatus} to ${nextStatus}.`,
      });
    }

    order.orderStatus = status;

    if (status === "DELIVERED") {
      order.deliveredAt = new Date();
    }

    order.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: sellerId,
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const trackingOrderController = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { orderId } = req.params;
    const { trackingNumber } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: "Tracking number is required.",
      });
    }

    const order = await orders.findOne({
      _id: orderId,
      "items.seller": sellerId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (
      !["PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(order.orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Tracking number can only be added after the order is packed.",
      });
    }

    order.trackingNumber = trackingNumber;

    if (order.orderStatus === "PACKED") {
      order.orderStatus = "SHIPPED";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Tracking number updated successfully.",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const reviewOrderController = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status.",
      });
    }

    const order = await orders.findOne({
      _id: orderId,
      "items.seller": sellerId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!order.request?.type) {
      return res.status(400).json({
        success: false,
        message: "No request found for this order.",
      });
    }

    if (order.request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This request has already been reviewed.",
      });
    }

    order.request.status = status;
    order.request.reviewedAt = new Date();
    order.request.reviewedBy = sellerId;

    if (status === "APPROVED") {
      switch (order.request.type) {
        case "CANCEL":
          order.orderStatus = "CANCELLED";
          order.cancelledAt = new Date();
          order.cancelReason = order.request.reason;

          if (order.paymentMethod === "RAZORPAY") {
            
            order.paymentStatus = "REFUNDED";
          }
          break;

        case "RETURN":
          order.orderStatus = "RETURN_REQUESTED";
          break;

        case "EXCHANGE":
          break;
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully.`,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
    getSellerDetailOrderController,
    getSellerOrderController,
    updateStatusOrderController,
    reviewOrderController,
    trackingOrderController,
}