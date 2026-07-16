import { setTheme } from "@/features/theme/state/theme.slice";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchAutocomplete from "./Searchautocomplete ";

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
const ThemeToggle = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  const options = [
    { value: "light", label: "Light", icon: "ri-sun-fill" },
    { value: "dark", label: "Dark", icon: "ri-moon-clear-fill" },
    { value: "system", label: "System", icon: "ri-computer-fill" },
  ];

  const getCurrentIcon = () => {
    if (theme === "light") return "ri-sun-fill";
    if (theme === "dark") return "ri-moon-clear-fill";
    return "ri-computer-fill";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Change Theme"
          className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 transition-all duration-200 hover:border-[#e63b1f]/50 hover:text-[#e63b1f] focus:outline-none active:scale-95"
        >
          <i className={`${getCurrentIcon()} text-[15px]`} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] shadow-xl p-1"
      >
        <div className="px-3 py-2 text-[10px] font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
          Appearance
        </div>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => dispatch(setTheme(option.value))}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-all duration-200 focus:outline-none ${
              theme === option.value
                ? "bg-[#e63b1f]/10 text-[#e63b1f]"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5"
            }`}
          >
            <i className={`${option.icon} text-base`} />
            <span className="flex-1 font-medium">{option.label}</span>
            {theme === option.value && (
              <div className="w-1.5 h-1.5 rounded-full bg-[#e63b1f]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ─── Icon Button ──────────────────────────────────────────────────────────────
const NavIconBtn = ({ icon, label, onClick, count = 0 }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="relative cursor-pointer flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 transition-all duration-200 hover:border-[#e63b1f]/50 hover:text-[#e63b1f] focus:outline-none active:scale-95"
  >
    <i className={`${icon} text-[15px]`} />

    {count > 0 && (
      <span className="absolute -top-2 -right-1  w-4 h-4 rounded-full bg-[#e63b1f] text-white text-[10px] font-bold flex items-center justify-center">
        {count > 99 ? "99+" : count}
      </span>
    )}
  </button>
);

// ─── Dropdown Item ────────────────────────────────────────────────────────────
const DropdownItem = ({ icon, label, onClick }) => (
  <DropdownMenuItem
    onClick={onClick}
    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all duration-200 focus:outline-none"
  >
    <i className={`${icon} text-base text-zinc-400 dark:text-zinc-500`} />
    <span className="font-medium">{label}</span>
  </DropdownMenuItem>
);

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef(null);

  const wishlistCount = useSelector(
    (state) => state.wishlist.items.length || 0,
  );
  const cartCount = useSelector((state) => state.cart.items.length || 0);

  // ⚠️ Replace with your actual Redux auth selector
  const user = useSelector((state) => state.auth.user); // { email, role } | null
  const isSeller = user?.role === "seller";

  // Close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    // dispatch(logoutAction()) — add your logout dispatch here
    setSidebarOpen(false);
    navigate("/auth/user/login");
  };

  const goTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>

      {/* ══════════════ NAVBAR ══════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-white/[0.07] bg-white/70 dark:bg-[#0d0d0d]/70 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-[58px] flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:text-[#e63b1f] hover:border-[#e63b1f]/50 transition-all duration-200 focus:outline-none flex-shrink-0"
          >
            <i className="ri-menu-line text-[16px]" />
          </button>

          {/* Brand */}
          <Link
            to="/"
            className="flex-shrink-0 leading-none select-none"
            style={{
              fontFamily: "'Bebas Neue', 'Anton', sans-serif",
              fontSize: "1.55rem",
              letterSpacing: "0.05em",
            }}
          >
            <span className="text-zinc-900 dark:text-white">OUT</span>
            <span className="text-[#e63b1f]">FIQUE</span>
          </Link>

          {/* Seller dashboard link — desktop only */}
          {isSeller && (
            <Link
              to="/seller/dashboard"
              className="hidden md:block text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-500 hover:text-[#e63b1f] transition-colors duration-200 ml-1 flex-shrink-0"
            >
              Dashboard
            </Link>
          )}

          {/* Search bar — desktop */}
          <div className="hidden md:flex flex-1 max-w-[420px] mx-auto">
            <SearchAutocomplete />
          </div>

          {/* Right icon group */}
          <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
            {/* Mobile search toggle */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => {
                setSearchOpen((v) => !v);
                setTimeout(() => searchRef.current?.focus(), 120);
              }}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:text-[#e63b1f] hover:border-[#e63b1f]/50 transition-all duration-200 focus:outline-none"
            >
              <i
                className={`${searchOpen ? "ri-close-line" : "ri-search-line"} text-[15px]`}
              />
            </button>

            {/* Wishlist + Cart — logged in only */}
            {user && (
              <>
                <div className="hidden md:block">
                  <NavIconBtn
                    icon="ri-heart-3-line"
                    label="Wishlist"
                    count={wishlistCount}
                    onClick={() => navigate("/wishlist")}
                  />
                </div>
                <div className="hidden md:block">
                  <NavIconBtn
                    icon="ri-shopping-bag-3-line"
                    label="Cart"
                    count={cartCount}
                    onClick={() => navigate("/checkout/cart")}
                  />
                </div>
              </>
            )}

            {/* Theme toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* User dropdown OR Sign In */}
            {user ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="User menu"
                      className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 transition-all duration-200 hover:border-[#e63b1f]/50 hover:text-[#e63b1f] focus:outline-none active:scale-95"
                    >
                      <i className="ri-user-3-line text-[15px]" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] shadow-2xl p-1 mt-1"
                  >
                    {/* Email + badge */}
                    <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-white/[0.07] mb-1">
                      <p className="text-[12px] font-semibold text-zinc-800 dark:text-white truncate leading-snug">
                        {user.email}
                      </p>
                      {isSeller ? (
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full bg-[#e63b1f]/10 text-[#e63b1f]">
                          <i className="ri-store-2-line text-[9px]" /> Seller
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/8 text-zinc-500 dark:text-zinc-400">
                          <i className="ri-user-line text-[9px]" /> Buyer
                        </span>
                      )}
                    </div>

                    <DropdownItem
                      icon="ri-user-3-line"
                      label="Profile"
                      onClick={() => navigate("/profile")}
                    />
                    <DropdownItem
                      icon="ri-heart-3-line"
                      label="Wishlist"
                      onClick={() => navigate("/wishlist")}
                    />
                    <DropdownItem
                      icon="ri-shopping-bag-3-line"
                      label="Cart"
                      onClick={() => navigate("/checkout/cart")}
                    />

                    {isSeller && (
                      <DropdownItem
                        icon="ri-store-2-line"
                        label="Seller Dashboard"
                        onClick={() => navigate("/seller/dashboard")}
                      />
                    )}

                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-white/[0.07] my-1" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 focus:outline-none"
                    >
                      <i className="ri-logout-box-r-line text-base" />
                      <span className="font-medium">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link
                to="/auth/user/login"
                className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#e63b1f] text-white text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-[#ff4f30] active:scale-95 transition-all duration-200 flex-shrink-0"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search — slides down below nav */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            searchOpen
              ? "max-h-16 opacity-100 overflow-visible border-t border-zinc-100 dark:border-white/[0.06]"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-4 py-2.5">
            <SearchAutocomplete
              ref={searchRef}
              onNavigate={() => setSearchOpen(false)}
            />
          </div>
        </div>
      </header>

      {/* ══════════════ MOBILE SIDEBAR ══════════════ */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Dimmed backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sliding panel */}
        <div
          className={`absolute left-0 top-0 h-full w-[280px] bg-white dark:bg-[#0f0f0f] border-r border-zinc-200 dark:border-white/[0.07] flex flex-col transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-5 h-[58px] border-b border-zinc-100 dark:border-white/[0.07] flex-shrink-0">
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              style={{
                fontFamily: "'Bebas Neue', 'Anton', sans-serif",
                fontSize: "1.4rem",
                letterSpacing: "0.05em",
              }}
            >
              <span className="text-zinc-900 dark:text-white">OUT</span>
              <span className="text-[#e63b1f]">FIQUE</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>

          {/* User info (logged in only) */}
          {user && (
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e63b1f]/10 border border-[#e63b1f]/20 flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-3-line text-[#e63b1f] text-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-zinc-800 dark:text-white truncate">
                    {user.email}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 mt-0.5 text-[9px] font-bold tracking-[0.15em] uppercase px-1.5 py-0.5 rounded-full ${
                      isSeller
                        ? "bg-[#e63b1f]/10 text-[#e63b1f]"
                        : "bg-zinc-100 dark:bg-white/8 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {isSeller ? (
                      <>
                        <i className="ri-store-2-line" /> Seller
                      </>
                    ) : (
                      <>
                        <i className="ri-user-line" /> Buyer
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
            <SidebarSection label="Menu" />
            <SidebarItem
              icon="ri-home-4-line"
              label="Home"
              onClick={() => goTo("/")}
            />

            {user && (
              <>
                <SidebarItem
                  icon="ri-user-3-line"
                  label="Profile"
                  onClick={() => goTo("/profile")}
                />
                <SidebarItem
                  icon="ri-heart-3-line"
                  label={`Wishlist (${wishlistCount})`}
                  onClick={() => goTo("/wishlist")}
                />
                <SidebarItem
                  icon="ri-shopping-bag-3-line"
                  label={`Cart (${cartCount})`}
                  onClick={() => navigate("/checkout/cart")}
                />
              </>
            )}

            {isSeller && (
              <SidebarItem
                icon="ri-store-2-line"
                label="Seller Dashboard"
                onClick={() => goTo("/seller/dashboard")}
              />
            )}

            <div className="pt-3">
              <SidebarSection label="Appearance" />
              <SidebarThemeSwitcher />
            </div>
          </nav>

          {/* Bottom auth button */}
          <div className="px-4 py-4 border-t border-zinc-100 dark:border-white/[0.07] flex-shrink-0">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-200"
              >
                <i className="ri-logout-box-r-line text-base" />
                Logout
              </button>
            ) : (
              <Link
                to="/auth/user/login"
                onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold tracking-[0.1em] uppercase text-white bg-[#e63b1f] hover:bg-[#ff4f30] transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Sidebar helpers ──────────────────────────────────────────────────────────
const SidebarSection = ({ label }) => (
  <p className="px-3 pb-1 pt-1 text-[10px] font-bold tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-600">
    {label}
  </p>
);

const SidebarItem = ({ icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-[#e63b1f] transition-all duration-200 text-left"
  >
    <i className={`${icon} text-base text-zinc-400 dark:text-zinc-500`} />
    {label}
  </button>
);

const SidebarThemeSwitcher = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  const options = [
    { value: "light", label: "Light", icon: "ri-sun-fill" },
    { value: "dark", label: "Dark", icon: "ri-moon-clear-fill" },
    { value: "system", label: "System", icon: "ri-computer-fill" },
  ];

  return (
    <div className="flex gap-1.5 px-3 pt-1 pb-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => dispatch(setTheme(o.value))}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-semibold tracking-wide uppercase transition-all duration-200 ${
            theme === o.value
              ? "border-[#e63b1f]/50 bg-[#e63b1f]/10 text-[#e63b1f]"
              : "border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/4 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20"
          }`}
        >
          <i className={`${o.icon} text-base`} />
          {o.label}
        </button>
      ))}
    </div>
  );
};

export default Navbar;
