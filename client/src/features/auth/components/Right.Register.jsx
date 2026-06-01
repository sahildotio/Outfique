import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import ContinueWithGoogle from "./ContinueWithGoogle";


const Right = () => {
  const navigate = useNavigate();
  const { handleRegister } = useAuth();
  useEffect(() => {
    document.title = "Sign Up - Outfique";
  })
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    isSeller: false,
  });

  

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };


  const submitHandler = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const user = await handleRegister({
      email: formData.email,
      contact: formData.contact,
      password: formData.password,
      fullName: formData.fullName,
      isSeller: formData.isSeller,
    });

    if (user.role == "buyer") {
      navigate("/")
    } else if(user.role == "seller") {
      navigate("/seller/dashboard")
    }
    
    setError("");
    setFormData({
      fullName: "",
      email: "",
      contact: "",
      password: "",
      confirmPassword: "",
      isSeller: false,
    });
  };

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-16 bg-[#f0ede8]">
      <div className="w-full max-w-md">
        {/* Eyebrow */}
        <p
          className="text-[0.65rem] tracking-[0.28em] uppercase text-[#8a7f6e] mb-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Welcome to Snitch
        </p>

        {/* Heading */}
        <h1
          className="text-4xl font-semibold tracking-wide text-[#1c1c1c] mb-1"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Elevate Your Style
        </h1>

        {/* Divider */}
        <div className="w-10 h-px bg-[#c4b99a] mt-3 mb-8" />

        <form className="space-y-5" onSubmit={submitHandler}>
          {/* Full Name */}
          <div>
            <label
              className="block text-[0.62rem] tracking-[0.2em] uppercase text-[#8a7f6e] mb-2"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full px-0 py-2 bg-transparent border-b border-[#c4b99a] text-[#1c1c1c] text-base placeholder-[#b5aa96] focus:outline-none focus:border-[#1c1c1c] transition-colors duration-300"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            />
          </div>

          {/* Email */}
          <div>
            <label
              className="block text-[0.62rem] tracking-[0.2em] uppercase text-[#8a7f6e] mb-2"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="hello@example.com"
              className="w-full px-0 py-2 bg-transparent border-b border-[#c4b99a] text-[#1c1c1c] text-base placeholder-[#b5aa96] focus:outline-none focus:border-[#1c1c1c] transition-colors duration-300"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            />
          </div>

          {/* Contact */}
          <div>
            <label
              className="block text-[0.62rem] tracking-[0.2em] uppercase text-[#8a7f6e] mb-2"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Contact Number
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-0 py-2 bg-transparent border-b border-[#c4b99a] text-[#1c1c1c] text-base placeholder-[#b5aa96] focus:outline-none focus:border-[#1c1c1c] transition-colors duration-300"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label
              className="block text-[0.62rem] tracking-[0.2em] uppercase text-[#8a7f6e] mb-2"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-0 py-2 bg-transparent border-b border-[#c4b99a] text-[#1c1c1c] text-base placeholder-[#b5aa96] focus:outline-none focus:border-[#1c1c1c] transition-colors duration-300 pr-8"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 bottom-2.5 text-[#8a7f6e] hover:text-[#1c1c1c] transition-colors cursor-pointer"
            >
              {showPassword ? (
                <i className="ri-eye-off-line text-base" />
              ) : (
                <i className="ri-eye-line text-base" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label
              className="block text-[0.62rem] tracking-[0.2em] uppercase text-[#8a7f6e] mb-2"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-0 py-2 bg-transparent border-b border-[#c4b99a] text-[#1c1c1c] text-base placeholder-[#b5aa96] focus:outline-none focus:border-[#1c1c1c] transition-colors duration-300 pr-8"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-0 bottom-2.5 text-[#8a7f6e] hover:text-[#1c1c1c] transition-colors cursor-pointer"
            >
              {showConfirmPassword ? (
                <i className="ri-eye-off-line text-base" />
              ) : (
                <i className="ri-eye-line text-base" />
              )}
            </button>
          </div>

          {/* Register as Seller */}
          <div className="flex items-center gap-3 pt-1">
            <input
              id="isSeller"
              type="checkbox"
              name="isSeller"
              checked={formData.isSeller}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer accent-[#1c1c1c] border border-[#c4b99a] rounded-none"
            />
            <label
              htmlFor="isSeller"
              className="text-[0.7rem] tracking-[0.15em] uppercase text-[#8a7f6e] cursor-pointer"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Register as a Seller
            </label>
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-red-500 text-sm"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-[#1c1c1c] text-[#f0ede8] text-[0.7rem] tracking-[0.3em] uppercase hover:bg-[#3a3a3a] transition-colors duration-300 cursor-pointer"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Sign Up
          </button>

          {/* Login link */}
          <p
            className="text-center text-sm text-[#8a7f6e]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Already have an account?{" "}
            <Link
              to="/auth/user/login"
              className="text-[#1c1c1c] underline underline-offset-4 hover:text-[#8a7f6e] transition-colors"
            >
              Login
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#c4b99a]" />
            <span
              className="text-[0.6rem] tracking-[0.2em] uppercase text-[#b5aa96]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              or
            </span>
            <div className="flex-1 h-px bg-[#c4b99a]" />
          </div>

          {/* Google */}
          <ContinueWithGoogle />
        </form>
      </div>
    </div>
  );
};

export default Right;

8709088970;