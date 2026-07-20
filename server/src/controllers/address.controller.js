import addressModel from "../models/address.model.js";
import profileModel from "../models/profile.model.js";

const createAddressController = async (req, res) => {
  try {
    const userid = req.user._id;
    const {
      fullName,
      phone,
      alternatePhone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      postalCode,
      addressType,
      isDefault,
    } = req.body;

    if (
      [fullName, phone, addressLine1, city, state, postalCode].some(
        (field) => field === undefined || field === null || field === "",
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
 
    const addressCount = await addressModel.countDocuments({ user: userid });
 
    const address = await addressModel.create({
      user: userid,
      fullName,
      phone,
      alternatePhone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      postalCode,
      addressType,
      isDefault: addressCount === 0 ? true : isDefault,
    });

    await profileModel.findOneAndReplace(
      { user: userid },
      { $push: { addresses: address._id } },
    );

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAddressController = async (req, res) => {
  try {
    const userid = req.user._id;
    const address = await addressModel
      .find({ user: userid })
      .sort({ createdAt: -1 });
    if (!address) {
      return res.status(404).json({
        success: true,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAddressByIdController = async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await addressModel.findById(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAddressController = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userid = req.user._id;

    const {
      fullName,
      phone,
      alternatePhone,
      address,
      landmark,
      city,
      state,
      postalCode,
      country,
      addressType,
      isDefault,
    } = req.body;

    const isExistingAddress = await addressModel.findOne({
      _id: addressId,
      user: userid,
    });
    if (!isExistingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (isDefault) {
      await addressModel.updateMany(
        { user: userid },
        { $set: { isDefault: false } },
      );
    }

    const updateAddress = await addressModel.findByIdAndUpdate(
      addressId,
      {
        fullName,
        phone,
        alternatePhone,
        address,
        landmark,
        city,
        state,
        postalCode,
        country,
        addressType,
        isDefault,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: updateAddress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAddressController = async (req, res) => {
    try {
        const { addressId } = req.params
        const userid = req.user._id
        const address = await addressModel.findOneAndReplace({
            _id: addressId,
            user: userid
        })
        if(!address){
            return res.status(404).json({
                success: false,
                message: "Address not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const setAsDefaultController = async (req, res) => {
        const { addressId } = req.params
        const userid = req.user._id

        const address = await addressModel.findOne({user: userid, _id: addressId})
        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            })
        }

        await addressModel.updateMany({user: userid}, {$set: {isDefault: false}})
        address.isDefault = true
        await  address.save()
            return res.status(200).json({
              success: true,
              message: "Default address updated successfully",
              address,
            });

};

export {
  createAddressController,
  deleteAddressController,
  getAddressByIdController,
  getAddressController,
  setAsDefaultController,
  updateAddressController,
};
