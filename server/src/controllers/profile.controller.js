import profileModel from "../models/profile.model.js"
import users from "../models/user.models.js"

/**
 * @Create Profile Controller
 */

const addProfileDetailController = async (req, res) => {
  try {
    const { userid } = req.params;
    const user = await users.findById(userid)
    const profile = await profileModel.create({
        user: userid,
        fullName: req.body.fullName,
        contact: req.body.contact,
        houseNo: req.body.houseNo,
        street: req.body.street,
        landmark: req.body.landmark,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pincode,
        addressType: req.body.addressType
    })

    return res.status(201).json({
        success: true,
        profile
    })
  } catch (error) {
    console.log("ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * @get all profile details
 */

const getProfileDetailController = async (req, res) => {
  try {
    const user = req.user;

    const profile = await profileModel
      .findOne({ user: user._id })
      .populate("user", "fullName email contact")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

export {
    addProfileDetailController,
    getProfileDetailController
}