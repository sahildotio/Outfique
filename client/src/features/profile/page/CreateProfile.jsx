import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useProfile } from "../hooks/useProfile.js";

const labelClass =
  "text-xs font-medium tracking-[0.1em] uppercase text-zinc-500 dark:text-zinc-400";

const inputClass =
  "w-full h-11 px-4 rounded-xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm focus:outline-none focus:border-[#e63b1f]/50 focus:ring-1 focus:ring-[#e63b1f]/30 transition-colors duration-200";

/* ─── tiny reusable input ─────────────────────────────────────────── */
const InputField = ({ label, name, value, onChange, placeholder = "" }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={name} className={labelClass}>
      {label}
    </label>
    <input
      id={name}
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={inputClass}
    />
  </div>
);

/* ─── section heading with accent bar ─────────────────────────────── */
const SectionHeading = ({ children }) => (
  <h2 className="flex items-center gap-2.5 text-xs font-bold tracking-[0.2em] uppercase text-zinc-900 dark:text-white mb-6">
    <span className="w-1 h-4 bg-[#e63b1f] shrink-0" />
    {children}
  </h2>
);

/* ─── address-type toggle button ──────────────────────────────────── */
const TypeBtn = ({ label, value, icon, current, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    aria-pressed={current === value}
    className={`flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl border text-sm font-medium transition-colors duration-200 ${
      current === value
        ? "bg-[#e63b1f] text-white border-[#e63b1f]"
        : "border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-white/30"
    }`}
  >
    <i className={`${icon} text-sm`} />
    {label}
  </button>
);

/* ─── main page ───────────────────────────────────────────────────── */
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
  const [submitting, setSubmitting] = useState(false);

  /* ── unchanged logic ── */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { handelCreateUserProfile } = useProfile();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
        setTimeout(() => navigate("/user/profile"), 1200);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-zinc-900 dark:text-white transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Page header */}
        <div className="mb-10">
          <span className="text-xs font-medium tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400">
            Personal Information
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            Create Profile
          </h1>
          <div className="mt-6 h-px bg-zinc-200 dark:bg-white/10" />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Details */}
          <section className="mb-10">
            <SectionHeading>Personal Details</SectionHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Alexander Vane"
              />
              <InputField
                label="Contact Number"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="+91 00000 00000"
              />
              <InputField
                label="Alternate Contact"
                name="alternateContact"
                value={formData.alternateContact}
                onChange={handleChange}
                placeholder="+91 00000 00000"
              />
            </div>
          </section>

          <div className="h-px bg-zinc-200 dark:bg-white/10 mb-10" />

          {/* Address Details */}
          <section className="mb-10">
            <SectionHeading>Address Details</SectionHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="House No."
                name="houseNo"
                value={formData.houseNo}
                onChange={handleChange}
                placeholder="101/A"
              />
              <InputField
                label="Street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Brutalist Boulevard"
              />
              <InputField
                label="Landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="Opposite the monolith"
              />
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New Delhi"
              />
              <InputField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Delhi"
              />
              <InputField
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="110001"
              />
              <InputField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="India"
              />

              {/* Address Type toggle */}
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Address Type</span>
                <div className="flex gap-2">
                  <TypeBtn
                    label="Home"
                    value="home"
                    icon="ri-home-4-line"
                    current={formData.addressType}
                    onClick={(v) =>
                      setFormData({ ...formData, addressType: v })
                    }
                  />
                  <TypeBtn
                    label="Work"
                    value="work"
                    icon="ri-briefcase-line"
                    current={formData.addressType}
                    onClick={(v) =>
                      setFormData({ ...formData, addressType: v })
                    }
                  />
                  <TypeBtn
                    label="Other"
                    value="other"
                    icon="ri-map-pin-line"
                    current={formData.addressType}
                    onClick={(v) =>
                      setFormData({ ...formData, addressType: v })
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Save CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#e63b1f] text-white text-sm font-semibold hover:bg-[#ff4f30] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {submitting ? (
              <>
                <i className="ri-loader-4-line animate-spin text-base" />
                Saving...
              </>
            ) : (
              <>
                Save Profile
                <i className="ri-arrow-right-line text-base" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
