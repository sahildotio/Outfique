import jwt from "jsonwebtoken";
import configure from "../config/config.js";
import users from "../models/user.models.js";
import redis from "../services/redis.service.js";

const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  
  if (accessToken) {
    const isTokenBlackList = await redis.get(accessToken);
      if (isTokenBlackList) {
        return res.status(401).json({
          success: false,
          message: "Token is blacklisted, Please login again",
        });
      }    
  }

  try {
    const decode = jwt.verify(accessToken, configure.ACCESS_TOKEN_SECRET)
    const user = await users.findById(decode.userid)
    if (user) {
      req.user = user
      return next()
    }
  } catch (err) {
    const refreshToken = req.cookie.refreshToken
    if(!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    const decode = jwt.verify(refreshToken, configure.REFRESH_TOKEN_SECRET)
    const user  = await users.findById(decode.userid)
    req.user = user
    next()
  }
};

const sellerMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    if (accessToken) {
     try {
       const decode = jwt.verify(accessToken, configure.ACCESS_TOKEN_SECRET)
       const user = await users.findById(decode.userid)
       if (user && user.role === "seller") {
         req.user = user
         return next()
       }
     } catch (error) {
       const refreshToken = req.cookies?.refreshToken
       if(!refreshToken) {
         return res.status(401).json({
           success: false,
           message: "Unauthorized user",
         });
       }
       const decode = jwt.verify(refreshToken, configure.REFRESH_TOKEN_SECRET)
       const user = await users.findById(decode.userid)
       if (!user) {
         return res.status(401).json({
           success: false,
           message: "User not found"
         })
       }

       if (user.role !== "seller") {
         return res.status(403).json({
           success: false,
           message: "Forbidden: Seller access only",
         })
       }

       req.user = user
       next()
     }
   }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export { authMiddleware, sellerMiddleware };
