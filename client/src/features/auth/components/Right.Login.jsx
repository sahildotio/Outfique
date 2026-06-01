import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router";
import ContinueWithGoogle from "./ContinueWithGoogle";

const Right = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign In - Outfique";
  })

  const submitHandler = async (e) => {
    e.preventDefault();
    const user = await handleLogin({ email, password });
    if (user.role == "buyer") {
      navigate("/")
    }else if(user.role == "seller") {
      navigate("/seller/dashboard")
    }
    setEmail("");
    setPassword("");
  };

  return (
    <div
      className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-16 bg-[#f0ede8] min-h-screen"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
    >
      <div className="w-full max-w-md">
        {/* Eyebrow */}
        <p className="text-[0.65rem] tracking-[0.28em] uppercase text-[#8a7f6e] mb-2">
          Welcome Back
        </p>

        {/* Heading */}
        <h1 className="text-4xl font-semibold tracking-wide text-[#1c1c1c] mb-1">
          Sign In
        </h1>

        {/* Divider */}
        <div className="w-10 h-px bg-[#c4b99a] mt-3 mb-8" />

        <form className="space-y-6" onSubmit={submitHandler}>
          {/* Email */}
          <div>
            <label className="block text-[0.62rem] tracking-[0.2em] uppercase text-[#8a7f6e] mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              className="w-full px-0 py-2 bg-transparent border-b border-[#c4b99a] text-[#1c1c1c] text-base placeholder-[#b5aa96] focus:outline-none focus:border-[#1c1c1c] transition-colors duration-300"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-[0.62rem] tracking-[0.2em] uppercase text-[#8a7f6e] mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-0 py-2 bg-transparent border-b border-[#c4b99a] text-[#1c1c1c] text-base placeholder-[#b5aa96] focus:outline-none focus:border-[#1c1c1c] transition-colors duration-300 pr-8"
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-[#1c1c1c] text-[#f0ede8] text-[0.7rem] tracking-[0.3em] uppercase hover:bg-[#3a3a3a] transition-colors duration-300 cursor-pointer"
          >
            Sign In
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-[#8a7f6e]">
            Don't have an account?{" "}
            <Link
              to="/auth/user/register"
              className="text-[#1c1c1c] underline underline-offset-4 hover:text-[#8a7f6e] transition-colors"
            >
              Sign Up
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#c4b99a]" />
            <span className="text-[0.6rem] tracking-[0.2em] uppercase text-[#b5aa96]">
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
