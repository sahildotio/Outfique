import { getCartByUserId } from "../dao/cart.dao.js";
import addressModel from "../models/address.model.js";
import orders from "../models/order.model.js";
import payments from "../models/payment.model.js";
import { createOrder } from "../services/payment.service.js";

const getAllOrderController = async (req, res) => {
  try {
    const buyerId = req.user._id;

    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      search,
      sort = "-createdAt",
    } = req.query;

    const query = {
      buyer: buyerId,
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
      .populate("items.product", "title slug images")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const totalOrders = await orders.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / Number(limit)),
      totalOrders,
      orders: ordersList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDetailOrderController = async (req, res) => {
  try {
    const { orderid } = req.params;

    const order = await orders.findById(orderid)
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Order detailed is fetched",
      order
    })
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orders.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    order.orderStatus = "CANCELLED";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const requestOrderController = async (req, res) => {
  try {
    const buyerId = req.user._id
    const { orderid } = req.params
    const { type, reason } = req.body
    
    if (!["CANCELLED", "RETURN", "EXCHANGED"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request type"
      })
    }

    const order = await orders.findOne({
      _id: orderid,
      buyer: buyerId
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }

    if (order.request?.status === "PENDING") {
      return res.status(400).json({
        success: false,
        message: "A request is already pending."
      })
    }

    if (type === "CANCEL") {
      if (!["PENDING", "CONFIRMED", "PROCESSING"].includes(order.orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "This order can't be cancelled now.",
        });
      }
    }

    if(type === "RETURN"){
      if (order.orderStatus !== "RETURN") {
        return res.status(400).json({
          success: false,
          message: "Only delivered orders can be returned"
        })
      }
    }

    if (type === "EXCHANGE") {
      if (order.orderStatus !== "DELIVERED") {
        return res.status(400).json({
          success: false,
          message: "Only delivered orders can be exchanged."
      })
    }
    }

    order.request = {
      type,
      reason,
      status: "PENDING",
      requestedAt: new Date()
    }

    await order.save()

    return res.status(200).json({
      success: true,
      message: `${type} request submitted successfully`,
      order
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const reviewOrderController = async (req, res) => {
  try {
    const { orderid } = req.params
    const { status } = req.body
    
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status."
      })
    }

    const order = await orders.findById(orderid)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }

    if (!order.request?.type) {
      return res.status(400).json({
        success: false,
        message: "No request found for this order"
      })
    }

    if (order.request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This request has already been reviewed"
      })
    }

    order.request.status = status 
    order.request.reviewedAt = new Date()
    order.request.reviewedBy = req.user._id

    if (status === "APPROVED") {
      switch (order.request.type) {
        case "CANCEL":
          order.orderStatus = "CANCELLED"
          order.cancelledAt = new Date()
          order.cancelReason = order.request.reason

          if (order.paymentMethod === "RAZORPAY") {
            order.paymentStatus = "REFUNDED"
          }
          break
        case "RETURN":
          order.orderStatus = "RETURN_REQUESTED"
          break
        case "EXCHANGE":
          break
      }
    }

    await order.save()

    return res.status(200).json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      order
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
    getAllOrderController,
    getDetailOrderController,
    deleteOrderController,
    requestOrderController,
    reviewOrderController,
}