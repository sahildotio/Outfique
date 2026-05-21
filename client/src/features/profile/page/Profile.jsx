import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../../auth/hooks/useAuth";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useProfile } from "../hooks/useProfile";

const Profile = () => {
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
      path: "/cart",
    },
    {
      title: "Wishlist",
      subtitle: "Your saved luxury selections",
      icon: "ri-heart-3-line",
      path: `/wishlist/${userid}`,
    },
    {
      title: "Security",
      subtitle: "Password & account settings",
      icon: "ri-shield-keyhole-line",
      path: "/security",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#f4f1ea] px-5 py-10 md:px-16"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <p className="uppercase tracking-[0.35em] text-[11px] text-[#9a8d7a] mb-3">
            Luxury Account
          </p>

          <h1 className="text-5xl font-semibold text-[#1d1d1d] tracking-wide">
            My Profile
          </h1>

          <div className="w-16 h-[1px] bg-[#c9bba7] mt-4"></div>

          <p className="text-[#7f7567] mt-4 text-lg">
            Manage your personal information and shopping activity
          </p>
        </div>

        <button
          onClick={() => navigate(`/create-profile/${userid}`)}
          className="
            flex items-center gap-3
            bg-[#1d1d1d]
            text-white
            px-8 py-3
            tracking-[0.25em]
            uppercase
            text-[11px]
            hover:bg-[#343434]
            transition-all
            duration-300
            shadow-lg
            hover:shadow-2xl
            hover:scale-[1.02]
            active:scale-95
            cursor-pointer
          "
        >
          <i className="ri-pencil-line text-lg"></i>
          Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div
        className="
          bg-[#f8f5ef]
          border border-[#ddd5ca]
          p-8 md:p-10
          mb-12
          transition-all
          duration-500
          hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]
          hover:border-[#1d1d1d]
        "
      >
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          {/* Avatar */}
          <div
            className="
              w-28 h-28
              rounded-full
              border border-[#cdbfae]
              flex items-center justify-center
              bg-[#efe9df]
              shadow-inner
            "
          >
            <i className="ri-user-3-line text-5xl text-[#1d1d1d]"></i>
          </div>

          {/* User Details */}
          <div className="flex-1">
            <p className="uppercase tracking-[0.28em] text-[11px] text-[#9a8d7a] mb-2">
              Personal Information
            </p>

            <h2 className="text-4xl text-[#1d1d1d] font-semibold tracking-wide">
              {profileData?.fullName || "Guest User"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] text-[#b5aa96] mb-1">
                  Email Address
                </p>

                <p className="text-[#1d1d1d] text-lg font-light flex items-center gap-2">
                  <i className="ri-mail-line"></i>
                  {user?.email || "example@gmail.com"}
                </p>
              </div>

              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] text-[#b5aa96] mb-1">
                  Phone Number
                </p>

                <p className="text-[#1d1d1d] text-lg font-light flex items-center gap-2">
                  <i className="ri-smartphone-line"></i>
                  {profileData?.contact}
                </p>
              </div>

              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] text-[#b5aa96] mb-1">
                  Address
                </p>

                <p className="text-[#1d1d1d] text-lg font-light flex items-center gap-2">
                  <i className="ri-home-4-line"></i>
                  {profileData?.houseNo}, {profileData?.street}
                </p>
              </div>

              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] text-[#b5aa96] mb-1">
                  Landmark
                </p>

                <p className="text-[#1d1d1d] text-lg font-light flex items-center gap-2">
                  <i className="ri-map-pin-line"></i>
                  {profileData?.landmark}
                </p>
              </div>

              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] text-[#b5aa96] mb-1">
                  City & State
                </p>

                <p className="text-[#1d1d1d] text-lg font-light flex items-center gap-2">
                  <i className="ri-building-line"></i>
                  {profileData?.city}, {profileData?.state}
                </p>
              </div>

              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] text-[#b5aa96] mb-1">
                  Country & Pincode
                </p>

                <p className="text-[#1d1d1d] text-lg font-light flex items-center gap-2">
                  <i className="ri-earth-line"></i>
                  {profileData?.country} - {profileData?.pincode}
                </p>
              </div>

              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] text-[#b5aa96] mb-1">
                  Address Type
                </p>

                <p className="text-[#1d1d1d] text-lg font-light flex items-center gap-2 capitalize">
                  <i className="ri-bookmark-line"></i>
                  {profileData?.addressType}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {profileMenus.map((menu, index) => (
          <div
            key={index}
            onClick={() => navigate(menu.path)}
            className="
              group
              bg-[#f8f5ef]
              border border-[#ddd5ca]
              p-7
              cursor-pointer
              transition-all
              duration-500
              hover:border-[#1d1d1d]
              hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)]
              hover:-translate-y-1
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] text-[#b5aa96] mb-2">
                  Dashboard Section
                </p>

                <h3 className="text-3xl font-semibold text-[#1d1d1d] tracking-wide">
                  {menu.title}
                </h3>

                <p className="text-[#7f7567] mt-3 text-base font-light leading-relaxed">
                  {menu.subtitle}
                </p>
              </div>

              <div
                className="
                  w-14 h-14
                  rounded-full
                  border border-[#c9bba7]
                  flex items-center justify-center
                  text-[#1d1d1d]
                  group-hover:bg-[#1d1d1d]
                  group-hover:text-white
                  transition-all
                  duration-500
                "
              >
                <i className={`${menu.icon} text-2xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-14">
        <button
          onClick={() => {
            handleLogout();

            toast.success("Logout Successfully", {
              icon: "✓",
            });

            setTimeout(() => {
              navigate("/");
            }, 1200);
          }}
          className="
            flex items-center gap-3
            border border-[#1d1d1d]
            px-8 py-3
            uppercase
            tracking-[0.28em]
            text-[11px]
            text-[#1d1d1d]
            hover:bg-[#1d1d1d]
            hover:text-white
            transition-all
            duration-300
            hover:shadow-xl
            hover:scale-[1.02]
            active:scale-95
            cursor-pointer
          "
        >
          <i className="ri-logout-box-r-line text-lg"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
