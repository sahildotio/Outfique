import React from "react";
import { useLocation, useNavigate } from "react-router";
import { motion, useReducedMotion } from "framer-motion";

// Shared with SellerOrder.jsx / SellerOrderDetail.jsx — worth lifting into
// one file (e.g. sellerUi.js) once a third page needs the same tokens.
const easeOut = [0.22, 1, 0.36, 1];
const easeLuxury = [0.76, 0, 0.24, 1];
const BRAND = "#e63b1f";
const EMERALD = "#10b981";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.25 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
};
const fadeUpReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  const item = reduceMotion ? fadeUpReduced : fadeUp;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-zinc-900 dark:text-white transition-colors duration-300 flex items-center justify-center px-6 py-10">
      <motion.div
        initial={
          reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="max-w-lg w-full rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] p-8 sm:p-10 text-center"
      >
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Success Icon */}
          <motion.div variants={item} className="flex justify-center mb-6">
            <motion.div
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.4 }
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                ease: easeLuxury,
                delay: 0.15,
              }}
              className="w-16 h-16 flex items-center justify-center rounded-full"
              style={{ backgroundColor: `${EMERALD}1A` }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
                style={{ color: EMERALD }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: easeOut, delay: 0.5 }}
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={item}
            className="text-2xl md:text-3xl font-semibold tracking-tight mb-2"
          >
            Order Confirmed
          </motion.h1>

          <motion.p
            variants={item}
            className="text-sm text-zinc-500 dark:text-zinc-400 mb-6"
          >
            Thank you for your purchase. Your order has been successfully
            placed.
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "2.5rem" }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.5 }}
            className="h-px mx-auto mb-6"
            style={{ backgroundColor: BRAND }}
          />

          {/* Order ID */}
          <motion.div
            variants={item}
            className="mb-6 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-100 dark:border-white/[0.06] py-4 px-5"
          >
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
              Order ID
            </p>
            <p className="text-base font-semibold text-zinc-900 dark:text-white break-all">
              {orderId}
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.button
              whileHover={reduceMotion ? {} : { y: -2 }}
              whileTap={reduceMotion ? {} : { scale: 0.97 }}
              transition={{ duration: 0.2, ease: easeLuxury }}
              onClick={() => navigate("/")}
              className="cursor-pointer rounded-xl px-6 py-3 text-sm font-medium text-white transition-colors duration-300"
              style={{ backgroundColor: BRAND }}
            >
              Continue Shopping
            </motion.button>

            <motion.button
              whileHover={reduceMotion ? {} : { y: -2 }}
              whileTap={reduceMotion ? {} : { scale: 0.97 }}
              transition={{ duration: 0.2, ease: easeLuxury }}
              onClick={() => navigate("/view-orders")}
              className="cursor-pointer rounded-xl px-6 py-3 text-sm font-medium border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white transition-colors duration-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]"
            >
              View Orders
            </motion.button>
          </motion.div>

          {/* Footer Note */}
          <motion.p
            variants={item}
            className="text-xs text-zinc-400 dark:text-zinc-500 mt-6"
          >
            A confirmation email has been sent to your registered email.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
