import jwt from "jsonwebtoken";
import configure from "../config/config.js";
import users from "../models/user.models.js";
import { sendEmail } from "../services/mail.service.js";
import redis from "../services/redis.service.js";
import { generateOTP, hashOTP } from "../utils/generateOtp.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
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
    const refreshToken = req.cookies.refreshToken;

    if (accessToken) {
      await redis.set(accessToken, "blacklisted", "EX", 15 * 60);
    }

    if (refreshToken) {
      await redis.set(refreshToken, "blacklisted", "EX", 15 * 24 * 60 * 60);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.json({
      success: true,
      message: "Logged out successfully",
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
 * @Forgot Password controller
 */

const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const user = await users.findOne({ email });
  console.log("Sending OTP to:", user.email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const otp = generateOTP();
  user.otp = hashOTP(otp);
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  const resetToken = generateResetToken(user._id);
  res.cookie("resetToken", resetToken, {
    httpOnly: true,
    secure: configure.NODE_ENV === "production" ? true : false,
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
  });
  await user.save();

  // await sendEmail(
  //   user.email,
  //   "Reset Password OTP",
  //   `Your OTP is ${otp}. It is valid for 5 minutes.`,
  //   `
  // <div style="background-color:#f5f5f4; padding:40px 20px; font-family: Helvetica, Arial, sans-serif;">
  //   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; margin:0 auto; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e7e5e4;">
  //     <tr>
  //       <td style="padding:40px 40px 20px 40px; text-align:center;">
  //         <p style="margin:0; font-size:11px; letter-spacing:4px; text-transform:uppercase; color:#78716c;">Outfique</p>
  //       </td>
  //     </tr>
  //     <tr>
  //       <td style="padding:0 40px;">
  //         <div style="height:1px; background-color:#e7e5e4;"></div>
  //       </td>
  //     </tr>
  //     <tr>
  //       <td style="padding:32px 40px 8px 40px;">
  //         <h1 style="margin:0; font-size:20px; font-weight:600; color:#1c1917; text-align:center;">
  //           Reset your password
  //         </h1>
  //       </td>
  //     </tr>
  //     <tr>
  //       <td style="padding:8px 40px 0 40px;">
  //         <p style="margin:0; font-size:14px; line-height:1.6; color:#57534e; text-align:center;">
  //           Hello ${user.fullName}, use the code below to reset your password.
  //         </p>
  //       </td>
  //     </tr>
  //     <tr>
  //       <td style="padding:28px 40px 8px 40px;">
  //         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  //           <tr>
  //             <td style="background-color:#fafaf9; border:1px solid #e7e5e4; border-radius:12px; padding:22px; text-align:center;">
  //               <p style="margin:0; font-size:32px; font-weight:600; letter-spacing:10px; color:#1c1917;">
  //                 ${otp}
  //               </p>
  //             </td>
  //           </tr>
  //         </table>
  //       </td>
  //     </tr>
  //     <tr>
  //       <td style="padding:16px 40px 0 40px;">
  //         <p style="margin:0; font-size:12px; color:#a8a29e; text-align:center;">
  //           This code expires in <strong style="color:#57534e;">5 minutes</strong>.
  //         </p>
  //       </td>
  //     </tr>
  //     <tr>
  //       <td style="padding:28px 40px 0 40px;">
  //         <div style="height:1px; background-color:#e7e5e4;"></div>
  //       </td>
  //     </tr>
  //     <tr>
  //       <td style="padding:20px 40px 40px 40px;">
  //         <p style="margin:0; font-size:12px; line-height:1.6; color:#a8a29e; text-align:center;">
  //           Didn't request this? You can safely ignore this email — your password will remain unchanged.
  //         </p>
  //       </td>
  //     </tr>
  //   </table>
  //   <p style="margin:24px 0 0 0; font-size:11px; color:#a8a29e; text-align:center;">
  //     © ${new Date().getFullYear()} Outfique. All rights reserved.
  //   </p>
  // </div>
  // `,
  // );
  try {
    await sendEmail(
      user.email,
      "Reset Password OTP",
      `Your OTP is ${otp}`,
      html,
    );

    console.log("Email sent");
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
  return res.status(200).json({
    success: true,
    message: "OTP sent to your email successfully.",
    resetToken
  });
};

/**
 * Reset Password controller
 */

const resetPasswordController = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { otp, password, confirmPassword } = req.body;

    if (!otp || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password do not match",
      });
    }
    let decoded;

    try {
      decoded = jwt.verify(resetToken, configure.RESET_PASSWORD_TOKEN);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const user = await users.findById(decoded.userid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== hashOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    user.password = password;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();
    res.clearCookie("resetToken");
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export {
  forgotPasswordController,
  getMeController,
  googleSuccessController,
  logoutController,
  resetPasswordController,
  userLoginController,
  userRegisterController,
};
