import jwt from "jsonwebtoken";
import users from "../models/user.models.js";
import configure from "../config/config.js";
import redis from "../services/redis.service.js";

const authMiddleware = async (req, res, next) => {

    const accessToken = req.cookies.accessToken;
    
    if(!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      })
    }

    const isTokenBlackList = await redis.get(accessToken)

    if (isTokenBlackList) {
      return res.status(401).json({
        success: false,
        message: "Token is blacklisted, Please login again"
      })
    }
    
    const decodedToken = jwt.verify(accessToken, configure.ACCESS_TOKEN_SECRET);
    const user = await users.findById(decodedToken.userid).select("-password -refreshToken");

    if(!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      })
    }
    req.user = user;
    next();

}

const sellerMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    const decodedToken = jwt.verify(
      accessToken,
      configure.ACCESS_TOKEN_SECRET,
    );
    
    const user = await users.findById(decodedToken.userid);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Forbidden, User must be seller",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export { authMiddleware, sellerMiddleware };
