import profileModel from "../models/profile.model.js";
import { uploadImage, deleteImage } from "../services/storage.service.js";

const createProfileController = async (req, res) => {
  const userid = req.user._id;

  const avatar = await uploadImage({
    buffer: req.file.buffer,
    fileName: req.file.originalname,
    folder: "Outfique/profileData",
  });

  const existingProfile = await profileModel.findOne({ user: userid });
  const { firstName, lastName, bio } = req.body;
  if (existingProfile) {
    return res.status(409).json({
      success: false,
      message: "Profile already exist",
    });
  }

  const profile = await profileModel.create({
    user: userid,
    firstName,
    lastName,
    avatar,
    bio,
  });

  return res.status(201).json({
    success: true,
    message: "Profile created successfully",
    profile,
  });
};

const getProfileController = async (req, res) => {
  try {
    const userid = req.user._id;
    const profile = await profileModel.findOne({ user: userid });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAvatarController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar is required",
      });
    }

    const profile = await profileModel.findOne({user: req.user._id})

    if(profile?.avatar?.publicId){
      await deleteImage(profile.avatar.publicId)
    }

    const upload = await uploadImage({
      buffer: req.file.buffer,
      fileName: req.file.originalname,
      folder: "Outfique/profileData",
    });

    profile.avatar = {
      url: upload.url,
      publicId: upload.fileId
    }

    await profile.save()
    return res.status(200).json({
      success: false,
      message: "Avatar updated successfully",
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const updateProfileController = async (req, res) => {
  try {
    const userid = req.user._id;
    const profile = await profileModel.findOneAndUpdate(
      { user: userid },
      req.body,
      { new: true, runValidators: true },
    );
    if (!profile) {
      return res.status(404).json({
        success: true,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteProfileController = async (req, res) => {
  try {
    const userid = req.user._id;
    const profile = await profileModel.findOneAndDelete({ user: userid });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Profile delete successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteAvatarController = async (req, res) => {
  try {
    const userid = req.user._id;
    const profile = await profileModel.findOne({ user: userid });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    profile.avatar = {
      url: "avatar-default-user-profile-icon-simple-flat-vector-57234190.avif",
      profileId: "",
    };

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Avatar removes successfully",
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createProfileController,
  deleteAvatarController,
  deleteProfileController,
  getProfileController,
  updateAvatarController,
  updateProfileController,
};
