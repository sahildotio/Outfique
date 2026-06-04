import jwt from "jsonwebtoken";
import configure from "../config/config.js";
import users from "../models/user.models.js";
import redis from "../services/redis.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

/**
 * @Register Controller
 */

const userRegisterController = async (req, res) => {
    const { email, contact, password, fullName, isSeller } = req.body;

    const userExists = await users.findOne({
      $or: [{ email }, { contact }],
    });

    if (userExists) {
      return res.status(400).json({
        message: "User with this email or contact already exists",
      });
    }

    const user = await users.create({
      email,
      contact,
      password,
      fullName,
      role: isSeller ? "seller" : "buyer",
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const createUser = await users
      .findById(user._id)
      .select("-password -otp -otpExpiry -refreshToken -mfaToken");
    if (!createUser) {
      return res.status(500).json({
        success: false,
        message: "User registration failed",
      });
    }

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: configure.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: configure.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: createUser,
    });

};

/**
 * @Login Controller
 */

const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email and password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const loginUser = await users
      .findById(user._id)
      .select("-password -otp -otpExpiry -refreshToken");

    if (!loginUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: configure.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: configure.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user: loginUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @GoogleSuccess controller
 */

const googleSuccessController = async (req, res) => {
  const { id, displayName, emails, photos } = req.user;
  const email = emails[0].value;

  let user = await users.findOne({ email });

  if (!user) {
    user = await users.create({
      email,
      googleId: id,
      fullName: displayName,
    });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const createUser = await users.findById(user._id).select("-refreshToken");

  if (!createUser) {
    return res.status(500).json({
      success: false,
      message: "User registration failed",
    });
  }

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: configure.NODE_ENV === "production" ? true : false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: configure.NODE_ENV === "production" ? true : false,
    sameSite: "lax",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });
  res.redirect("http://localhost:5173/");
};

/**
 * @Me Controller
 */

const getMeController = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullName,
        contact: user.contact,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @Logout controller
 */

const logoutController = async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Access token not found",
      });
    }

    const decodeAccessToken = jwt.decode(accessToken);

    if (decodeAccessToken) {
      const expiresIn = decodeAccessToken.exp - Math.floor(Date.now() / 1000);
      await redis.sadd(`blacklisted:${decodeAccessToken.userid}`, accessToken);
      await redis.expire(`blacklisted:${decodeAccessToken.userid}`, expiresIn);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
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
  getMeController,
  googleSuccessController,
  logoutController,
  userLoginController,
  userRegisterController,
};
