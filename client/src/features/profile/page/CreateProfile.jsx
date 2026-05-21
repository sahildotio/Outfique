import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useProfile } from "../hooks/useProfile.js";

const CreateProfile = () => {
  const { userid } = useParams();

  const [formData, setFormData] = useState({
    fullName: "",
    contact: "",
    alternateContact: "",
    houseNo: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    addressType: "home",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const { handelCreateUserProfile } = useProfile();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await handelCreateUserProfile(userid, {
        fullName: formData.fullName,
        contact: formData.contact,
        alternateContact: formData.alternateContact,
        houseNo: formData.houseNo,
        street: formData.street,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        addressType: formData.addressType,
      });

      if (data) {
        toast.success("Profile Created Successfully");

        setTimeout(() => {
          navigate("/user/profile");
        }, 1200);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    }
  };
  return (
    <div
      className="min-h-screen bg-[#f0ede8] px-6 py-10 md:px-16"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      {/* Header */}
      <div className="mb-10">
        <p className="text-[0.65rem] tracking-[0.28em] uppercase text-[#8a7f6e] mb-2">
          Personal Information
        </p>

        <h1 className="text-4xl md:text-5xl font-semibold text-[#1c1c1c] tracking-wide">
          Create Profile
        </h1>

        <div className="w-12 h-px bg-[#c4b99a] mt-4"></div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center h-full w-full">
        <form
          onSubmit={handleSubmit}
          className="
          max-w-5xl
          bg-[#f7f4ef]
          border border-[#ddd8d0]
          p-8 md:p-10
          shadow-[0_8px_32px_rgba(28,28,28,0.05)]
        "
        >
          {/* Personal Info */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-[#1c1c1c] mb-6">
              Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />

              <InputField
                label="Contact Number"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
              />

              <InputField
                label="Alternate Contact"
                name="alternateContact"
                value={formData.alternateContact}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Address */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-[#1c1c1c] mb-6">
              Address Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="House No"
                name="houseNo"
                value={formData.houseNo}
                onChange={handleChange}
              />

              <InputField
                label="Street"
                name="street"
                value={formData.street}
                onChange={handleChange}
              />

              <InputField
                label="Landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
              />

              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />

              <InputField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />

              <InputField
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
              />

              <InputField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />

              {/* Address Type */}
              <div>
                <label className="block text-[0.7rem] tracking-[0.2em] uppercase text-[#8a7f6e] mb-2">
                  Address Type
                </label>

                <select
                  name="addressType"
                  value={formData.addressType}
                  onChange={handleChange}
                  className="
                  w-full
                  border border-[#d4cec2]
                  bg-transparent
                  px-4 py-3
                  outline-none
                  focus:border-[#1c1c1c]
                  transition-all
                "
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="flex items-center justify-center ">
            <button
              onClick={() => {
                navigate("/user/profile");
              }}
              type="submit"
              className="
            px-10 py-3
            bg-[#1c1c1c]
            text-[#f0ede8]
            text-[0.7rem]
            tracking-[0.3em]
            uppercase
            hover:bg-[#343434]
            hover:scale-[1.02]
            active:scale-95
            transition-all
            duration-300
            shadow-lg
            cursor-pointer
          "
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange }) => {
  return (
    <div>
      <label className="block text-[0.7rem] tracking-[0.2em] uppercase text-[#8a7f6e] mb-2">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full
          border border-[#d4cec2]
          bg-transparent
          px-4 py-3
          outline-none
          focus:border-[#1c1c1c]
          transition-all
        "
      />
    </div>
  );
};

export default CreateProfile;
