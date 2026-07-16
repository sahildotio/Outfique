import addressModel from "../models/address.model.js"
import profileModel from "../models/profile.model.js"

const createAddressController = async (req, res) => {
    try {
        const userid = req.user._id
        const {fullName, phone, alternatePhone, addressLine1, addressLine2, landmark, city, state, country, postalCode, addressType, isDefault} = req.body

        if([fullName, phone, addressLine1, city, state, postalCode].some(field => field === undefined || field === null || field === '')) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        const addressCount = await addressModel.countDocuments({user: userid})
        
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

        await profileModel.findOneAndUpdate({ user: userid }, {$push: {addresses: address._id}})

        return res.status(201).json({
            success: true,
            message: 'Address created successfully',
            address
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export {
    createAddressController
}
