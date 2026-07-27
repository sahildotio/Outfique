import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ThemeToggle from "@/features/theme/components/ThemeToggle";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import ContinueWithGoogle from "../components/ContinueWithGoogle";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const { handleLogin, handleForgotPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign In - Outfique";
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    const user = await handleLogin({ email, password });
    if (user.role == "buyer") {
      navigate("/");
    } else if (user.role == "seller") {
      navigate("/seller/analytics");
    }
    setEmail("");
    setPassword("");
  };

  const handlePassword =async (e) => {
    e.preventDefault()
    const data = await handleForgotPassword({ email: forgotEmail })
    if (data?.success) {
      navigate(`/reset/${data.resetToken}`)
    }
  }
  return (
    <div className="h-screen flex font-sans overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-10">
        {/* Full-bleed background image */}
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80&fit=crop&crop=top"
          alt="fashion model"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ filter: "brightness(0.45)" }}
        />

        {/* Dark gradient overlay — bottom fade for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.10) 40%, rgba(10,10,10,0.75) 100%)",
          }}
        />

        {/* Red right edge accent */}
        <div
          className="absolute top-0 right-0 w-[3px] h-full"
          style={{
            background: "linear-gradient(180deg, #e63b1f 0%, transparent 70%)",
          }}
        />

        {/* Logo badge — top left */}
        <div className="relative z-10">
          <div className="w-9 h-9 rounded-full border border-[#e63b1f]/70 flex items-center justify-center backdrop-blur-sm bg-black/20">
            <i className="ri-compass-3-line text-[#e63b1f]" />
          </div>
        </div>

        {/* Brand copy — bottom left */}
        <div className="relative z-10">
          <p className="text-[#e63b1f] text-[10px] font-bold tracking-[0.35em] uppercase mb-3">
            Established 2024
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
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-7">
            A signature collection for the discerning aesthetic. Crafted for
            those who define the new standard of premium apparel.
          </p>
          <p className="text-zinc-400 dark:text-white/20text-xs tracking-widest mt-6">
            © 2026
          </p>
        </div>
      </div>
      <div className="relative z-10">
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
          <ThemeToggle />
        </div>
      </div>
      {/* ── RIGHT PANEL  ── */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#111] px-8 sm:px-16 lg:px-20 transition-colors duration-300">
        <div className="w-full max-w-md">
          <p className="text-[#e63b1f] text-xs font-bold tracking-[0.25em] uppercase mb-2">
            Outfique
          </p>
          <h2
            className="text-zinc-900 dark:text-white mb-2"
            style={{
              fontFamily: "'Bebas Neue', 'Anton', sans-serif",
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              letterSpacing: "0.02em",
              lineHeight: 1,
            }}
          >
            LOGIN
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-7">
            Don't have an account yet?{" "}
            <Link
              to="/auth/user/register"
              className="text-zinc-800 dark:text-white underline underline-offset-2 hover:text-[#e63b1f] transition-colors"
            >
              Create account
            </Link>
          </p>

          {/* Google */}
          <ContinueWithGoogle />

          {/* Divider */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-zinc-300 dark:bg-white/10" />
            <span className="text-zinc-500 dark:text-white/20 text-xs tracking-widest uppercase">
              or
            </span>
            <div className="flex-1 h-px bg-zinc-300 dark:bg-white/10" />
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <form onSubmit={submitHandler}>
              <div>
                <label className="block text-zinc-600 dark:text-white/50 text-[11px] font-semibold tracking-[0.15em] uppercase mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-base" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                      w-full
                      mt-2
                      bg-white dark:bg-[#1a1a1a]
                      border border-zinc-300 dark:border-white/10
                      rounded
                      text-zinc-900 dark:text-white
                      placeholder-zinc-400 dark:placeholder-white/20
                      text-sm
                      py-3 pl-9 pr-4
                      focus:outline-none
                      focus:border-[#e63b1f]/60
                      focus:bg-zinc-50 dark:focus:bg-[#1e1e1e]
                      transition-all duration-200
                      mb-4
                      "
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-zinc-600 dark:text-white/50 text-[11px] font-semibold tracking-[0.15em] uppercase">
                    Password
                  </label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-[11px] font-semibold uppercase tracking-wider text-[#e63b1f] hover:text-[#ff4f30] cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Forgot Password?</DialogTitle>

                        <DialogDescription>
                          Enter the email address associated with your account
                          and we'll send a one-time verification code (OTP) to
                          reset your password.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email Address</Label>

                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="you@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                        />
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          onClick={handlePassword}
                          className="w-full bg-[#e63b1f] hover:bg-[#ff4f30] cursor-pointer"
                        >
                          Send OTP
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/20 text-base" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="
w-full
mt-2

bg-white dark:bg-[#1a1a1a]
border border-zinc-300 dark:border-white/10
rounded
text-zinc-900 dark:text-white
placeholder-zinc-400 dark:placeholder-white/20
text-sm
py-3 pl-9 pr-4
focus:outline-none
focus:border-[#e63b1f]/60
focus:bg-zinc-50 dark:focus:bg-[#1e1e1e]
transition-all duration-200
"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/20 hover:text-zinc-700 dark:hover:text-white/50 transition-colors"
                  >
                    <i
                      className={`text-base ${showPassword ? "ri-eye-off-line" : "ri-eye-line"}`}
                    />
                  </button>
                </div>
              </div>
              <button
                className="w-full py-2.5 bg-[#e63b1f]
text-white
hover:bg-[#ff4f30] text-xs font-bold uppercase rounded border cursor-pointer hover:text-zinc-900 hover:bg-white hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 mt-8"
                style={{ letterSpacing: "0.15em" }}
              >
                Sign In
              </button>
            </form>
          </div>

          <p className="text-zinc-600 dark:text-white/15 text-xs text-center mt-8 tracking-wider">
            © 2026 Outfique. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
    </div>
  );
}
