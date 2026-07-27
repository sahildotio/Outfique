import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../../auth/hooks/useAuth";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useProfile } from "../hooks/useProfile";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

/* ─── reusable display field ──────────────────────────────────────── */
const DataField = ({ label, value }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-medium tracking-[0.1em] uppercase text-zinc-500 dark:text-zinc-400">
      {label}
    </span>
    <span className="text-sm font-medium text-zinc-900 dark:text-white">
      {value || "Not provided"}
    </span>
  </div>
);

/* ─── section heading with accent bar ─────────────────────────────── */
const SectionHeading = ({ children }) => (
  <h2 className="flex items-center gap-2.5 text-xs font-bold tracking-[0.2em] uppercase text-zinc-900 dark:text-white mb-6">
    <span className="w-1 h-4 bg-[#e63b1f] shrink-0" />
    {children}
  </h2>
);

/* ─── dashboard menu card ─────────────────────────────────────────── */
const MenuCard = ({ title, subtitle, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-sm transition-all duration-200 text-left"
  >
    <div className="min-w-0">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
        {subtitle}
      </p>
    </div>
    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-white/[0.06] group-hover:bg-[#e63b1f]/10 transition-colors duration-200">
      <i
        className={`${icon} text-base text-zinc-500 dark:text-zinc-400 group-hover:text-[#e63b1f] transition-colors duration-200`}
      />
    </div>
  </button>
);

/* ─── main component — all original data logic preserved ──────────── */
const Profile = () => {
  const reduceMotion = useReducedMotion();

  /* ── original logic: untouched ── */
  const user = useSelector((state) => state.auth.user);
  const { handleLogout } = useAuth();
  const { handleGetProfileDetails } = useProfile();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const userid = user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await handleGetProfileDetails();
        setProfileData(res);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProfile();
  }, []);

  const profileMenus = [
    {
      title: "Shopping Cart",
      subtitle: "Manage products ready for checkout",
      icon: "ri-shopping-bag-3-line",
      path: "/checkout/cart",
    },
    {
      title: "Wishlist",
      subtitle: "Your saved luxury selections",
      icon: "ri-heart-3-line",
      path: `/wishlist`,
    },
  ];
  /* ── end original logic ── */

  const displayName = profileData?.fullName || user?.name || "Member";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-zinc-900 dark:text-white transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Hero */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="mb-12"
        >
          <span className="text-xs font-medium tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400">
            My Account
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            Hi, {displayName}
          </h1>
          {user?.email && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {user.email}
            </p>
          )}
          <div className="mt-6 h-px bg-zinc-200 dark:bg-white/10" />
        </motion.div>

        {/* Personal Identity + Registered Address */}
        <motion.section
          initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease, delay: 0.05 }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-14 mb-14"
        >
          <div>
            <SectionHeading>Personal Identity</SectionHeading>
            <div className="flex flex-col gap-6">
              <DataField label="Email Address" value={user?.email} />
              <DataField label="Phone Number" value={profileData?.contact} />
              <DataField
                label="Alternate Contact"
                value={profileData?.alternateContact}
              />
              <DataField
                label="Address Type"
                value={profileData?.addressType}
              />
            </div>
          </div>

          <div>
            <SectionHeading>Registered Address</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <DataField
                label="House No / Name"
                value={
                  profileData?.houseNo
                    ? `${profileData.houseNo}${profileData.street ? ", " + profileData.street : ""}`
                    : undefined
                }
              />
              <DataField label="Street" value={profileData?.street} />
              <DataField label="Landmark" value={profileData?.landmark} />
              <DataField
                label="City / State"
                value={
                  profileData?.city && profileData?.state
                    ? `${profileData.city} / ${profileData.state}`
                    : profileData?.city || profileData?.state
                }
              />
              <DataField label="Pincode" value={profileData?.pincode} />
              <DataField label="Country" value={profileData?.country} />
            </div>
          </div>
        </motion.section>

        <div className="h-px bg-zinc-200 dark:bg-white/10 mb-14" />

        {/* Menu cards */}
        <motion.section
          initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease, delay: 0.1 }}
          className="mb-14"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {profileMenus.map((menu, index) => (
              <MenuCard
                key={index}
                title={menu.title}
                subtitle={menu.subtitle}
                icon={menu.icon}
                onClick={() => navigate(menu.path)}
              />
            ))}
          </div>
        </motion.section>

        {/* Actions: Edit + Logout */}
        <motion.section
          initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={() => navigate(`/create-profile/${userid}`)}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#e63b1f] text-white text-sm font-semibold hover:bg-[#ff4f30] active:scale-[0.99] transition-all duration-200"
          >
            <i className="ri-pencil-line text-base" />
            Edit Profile
          </button>

          <button
            onClick={() => {
              handleLogout();
              toast.success("Logout Successfully", { icon: "✓" });
              setTimeout(() => navigate("/"), 1200);
            }}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-rose-600 dark:hover:text-rose-400 active:scale-[0.99] transition-all duration-200"
          >
            <i className="ri-logout-box-r-line text-base" />
            Logout
          </button>
        </motion.section>
      </div>
    </div>
  );
};

export default Profile;
