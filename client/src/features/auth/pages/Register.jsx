import ThemeToggle from "@/features/theme/components/ThemeToggle";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import ContinueWithGoogle from "../components/ContinueWithGoogle";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { handleRegister } = useAuth();

  useEffect(() => {
    document.title = "Register | Outfique";
  }, []);

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
      fullName: formData.fullName,
      email: formData.email,
      contact: formData.contact,
      password: formData.password,
      isSeller: formData.isSeller,
    });

    if (user.role == "buyer") {
      navigate("/");
    } else if (user.role == "seller") {
      navigate("/seller/analytics");
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
    <div className="h-screen flex font-sans overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-10">
        {/* Full-bleed background image */}
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80&fit=crop&crop=top"
          alt="fashion model"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ filter: "brightness(0.40)" }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.20) 0%, rgba(10,10,10,0.05) 35%, rgba(10,10,10,0.80) 100%)",
          }}
        />

        {/* Red right edge accent */}
        <div
          className="absolute top-0 right-0 w-[3px] h-full"
          style={{
            background: "linear-gradient(180deg, #e63b1f 0%, transparent 70%)",
          }}
        />

        {/* Logo badge */}
        <div className="relative z-10">
          <div className="w-9 h-9 rounded-full border border-[#e63b1f]/70 flex items-center justify-center backdrop-blur-sm bg-black/20">
            <i className="ri-compass-3-line text-[#e63b1f]" />
          </div>
        </div>

        {/* Brand copy — bottom */}
        <div className="relative z-10">
          <p className="text-[#e63b1f] text-[10px] font-bold tracking-[0.35em] uppercase mb-3">
            Established 2025
          </p>
          <h1
            className="text-white leading-none mb-5"
            style={{
              fontFamily: "'Bebas Neue', 'Anton', sans-serif",
              fontSize: "clamp(4rem, 8vw, 7rem)",
              letterSpacing: "0.01em",
              textShadow: "0 2px 40px rgba(0,0,0,0.8)",
            }}
          >
            <span className="tracking-[0.2em]">Outfique</span>
          </h1>
          <div className="w-12 h-px bg-white/20 mb-4" />
          <p className="text-white/50 text-sm leading-relaxed max-w-[260px]">
            Join the collective. Define the aesthetic. Be part of something that
            sets the new standard in premium apparel.
          </p>
          <p className="text-zinc-400 text-xs tracking-widest mt-6">© 2026</p>
        </div>
      </div>
      <div className="relative z-10">
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
          <ThemeToggle />
        </div>
      </div>
      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-white  dark:bg-[#111] px-8 sm:px-14 lg:px-16 h-full transition-colors duration-300 overflow-y-auto">
        <div className="w-full h-[96%] max-w-md py-10">
          <p className="text-[#e63b1f] text-[10px] font-bold tracking-[0.25em] uppercase mb-1.5">
            Outfique
          </p>
          <h2
            className="text-zinc-900 dark:text-white mb-1"
            style={{
              fontFamily: "'Bebas Neue', 'Anton', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              letterSpacing: "0.02em",
              lineHeight: 1,
            }}
          >
            CREATE ACCOUNT
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-4">
            Already have one?{" "}
            <Link
              to="/auth/user/login"
              className="text-zinc-800 dark:text-white underline underline-offset-2 hover:text-[#e63b1f] transition-colors"
            >
              Sign in
            </Link>
          </p>

          {/* Google */}
          <ContinueWithGoogle />

          {/* Divider */}
          <div className="flex items-center gap-3 mt-5 mb-4">
            <div className="flex-1 h-px bg-zinc-300 dark:bg-white/10" />
            <span className="text-zinc-500 dark:text-white/20 text-xs tracking-widest uppercase">
              or
            </span>
            <div className="flex-1 h-px bg-zinc-300 dark:bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={submitHandler}>
            {/* Role selector */}
            <div className="mb-3">
              <label className="block text-zinc-600 dark:text-white/40 text-[10px] font-semibold tracking-[0.15em] uppercase mb-1.5">
                Continue As
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["buyer", "seller"].map((r) => {
                  const isActive =
                    (formData.isSeller ? "seller" : "buyer") === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          isSeller: r === "seller",
                        }))
                      }
                      className={`flex cursor-pointer flex-col items-start px-3 py-2.5 rounded border transition-all duration-200 ${
                        isActive
                          ? "bg-[#e63b1f] border-[#e63b1f] text-white"
                          : "bg-white dark:bg-[#1a1a1a] border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-white/40 hover:border-zinc-400 dark:hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div
                          className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isActive
                              ? "border-white"
                              : "border-zinc-400 dark:border-white/30"
                          }`}
                        >
                          {isActive && (
                            <div className="w-1 h-1 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs font-bold tracking-wide uppercase">
                          {r}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] pl-[18px] ${
                          isActive
                            ? "text-white/80"
                            : "text-zinc-500 dark:text-white/25"
                        }`}
                      >
                        {r === "buyer"
                          ? "Shop the collection"
                          : "List & sell products"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-2.5">
              {/* Full Name */}
              <div>
                <label className="block text-zinc-600 dark:text-white/40 text-[10px] font-semibold tracking-[0.15em] uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/20 text-sm" />
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-zinc-300 dark:border-white/10 rounded text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-xs py-2.5 pl-8 pr-3 focus:outline-none focus:border-[#e63b1f]/60 focus:bg-zinc-50 dark:focus:bg-[#1e1e1e] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-zinc-600 dark:text-white/40 text-[10px] font-semibold tracking-[0.15em] uppercase mb-1">
                  Email
                </label>
                <div className="relative">
                  <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/20 text-sm" />
                  <input
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-zinc-300 dark:border-white/10 rounded text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-xs py-2.5 pl-8 pr-3 focus:outline-none focus:border-[#e63b1f]/60 focus:bg-zinc-50 dark:focus:bg-[#1e1e1e] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-zinc-600 dark:text-white/40 text-[10px] font-semibold tracking-[0.15em] uppercase mb-1">
                  Contact
                </label>
                <div className="relative">
                  <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/20 text-sm" />
                  <input
                    name="contact"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-zinc-300 dark:border-white/10 rounded text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-xs py-2.5 pl-8 pr-3 focus:outline-none focus:border-[#e63b1f]/60 focus:bg-zinc-50 dark:focus:bg-[#1e1e1e] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-zinc-600 dark:text-white/40 text-[10px] font-semibold tracking-[0.15em] uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/20 text-sm" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-zinc-300 dark:border-white/10 rounded text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-xs py-2.5 pl-8 pr-3 focus:outline-none focus:border-[#e63b1f]/60 focus:bg-zinc-50 dark:focus:bg-[#1e1e1e] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/20 hover:text-zinc-700 dark:hover:text-white/50 transition-colors"
                  >
                    <i
                      className={`text-sm ${showPassword ? "ri-eye-off-line" : "ri-eye-line"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-zinc-600 dark:text-white/40 text-[10px] font-semibold tracking-[0.15em] uppercase mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <i className="ri-lock-2-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/20 text-sm" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-zinc-300 dark:border-white/10 rounded text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-xs py-2.5 pl-8 pr-3 focus:outline-none focus:border-[#e63b1f]/60 focus:bg-zinc-50 dark:focus:bg-[#1e1e1e] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/20 hover:text-zinc-700 dark:hover:text-white/50 transition-colors"
                  >
                    <i
                      className={`text-sm ${showConfirmPassword ? "ri-eye-off-line" : "ri-eye-line"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-[#e63b1f] text-[11px] tracking-wide">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#e63b1f] text-white hover:bg-white hover:text-zinc-900 hover:border-zinc-300 text-xs font-bold uppercase rounded border border-[#e63b1f] cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 mt-1"
                style={{ letterSpacing: "0.15em" }}
              >
                Create Account
              </button>
            </div>
          </form>

          <p className="text-zinc-400 dark:text-white/15 text-[10px] text-center mt-5 tracking-wider">
            © 2026 Outfique. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
    </div>
  );
}
