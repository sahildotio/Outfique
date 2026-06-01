import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useProduct } from "../hooks/useProduct";
import { useNavigate } from "react-router";

const Home = () => {
  const products = useSelector((state) => state.product.allProducts);
  const { handleGetAllProducts, handleSearchProducts } = useProduct();

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [openDropDown, setOpenDropDown] = useState(false)
  const navigate = useNavigate();

  // Load all products initially
  useEffect(() => {
    handleGetAllProducts();
  }, []);

  // Debounced search
useEffect(() => {
  const timer = setTimeout(() => {
    if (search.trim()) {
      handleSearchProducts(search);
      setOpenDropDown(true);
    } else {
      handleGetAllProducts();
      setOpenDropDown(false);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [search]);

  // Auto show search on tablet/desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSearch(true);
      } else {
        setShowSearch(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
  document.title = "Premium Minimalist Fashion - Outfique";
})

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen selection:bg-[#C9A96E]/30"
        style={{
          backgroundColor: "#fbf9f6",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">
          {/* SEARCH BAR */}
          <div className="w-full flex items-center justify-center m-4">
            <div className="relative flex items-center">
              {/* INPUT */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out z-10 ${
                  showSearch
                    ? "w-64 sm:w-80 md:w-96 lg:w-[480px] opacity-100 mr-3"
                    : "w-0 opacity-0"
                }`}
              >
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => {
                    if (search.trim()) setOpenDropDown(true);
                  }}
                  onBlur={() => setTimeout(() => setOpenDropDown(false), 200)}
                  placeholder="Search for products, brands and more"
                  className="w-full border border-gray-300 px-5 py-2.5 rounded-full outline-none shadow-sm focus:ring-2 focus:ring-[#C9A96E] text-sm transition-all bg-white"
                />
              </div>

              {/* TOGGLE BUTTON */}
              <button
                onClick={() => {
                  setShowSearch(!showSearch);
                  if (showSearch) {
                    setSearch("");
                    setOpenDropDown(false);
                  }
                }}
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 z-10"
              >
                <i
                  className={`text-xl transition-transform duration-300 ${
                    showSearch
                      ? "ri-close-large-line rotate-90"
                      : "ri-search-line"
                  }`}
                ></i>
              </button>

              {showSearch && openDropDown && search.trim() && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border shadow-lg rounded-2xl max-h-[400px] overflow-y-auto z-50">
                  {products.length > 0 ? (
                    products.slice(0, 6).map((item) => (
                      <div
                        key={item._id}
                        onClick={() => {
                          navigate(`/product/${item._id}`);
                          setSearch("");
                          setOpenDropDown(false);
                          setShowSearch(false);
                        }}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <img
                          src={item.productImages?.[0]?.url}
                          className="w-12 h-14 object-cover rounded"
                        />

                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {item.description}
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-[#8a7342]">
                          {item.price?.currency} {item.price?.amount}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* HERO */}
          <div className="pt-12 sm:pt-20 pb-14 sm:pb-20 text-center flex flex-col items-center">
            <span
              className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium mb-4 sm:mb-6"
              style={{ color: "#C9A96E" }}
            >
              The Collection
            </span>
            <h1
              className="text-3xl sm:text-5xl lg:text-7xl font-light leading-tight mb-4 sm:mb-6"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#1b1c1a",
              }}
            >
              Curated Archive
            </h1>
            <p
              className="max-w-xl mx-auto text-xs sm:text-base leading-relaxed px-2"
              style={{ color: "#7A6E63" }}
            >
              Discover our latest curation of premium minimalist pieces,
              meticulously designed for effortless elegance and enduring
              quality.
            </p>
          </div>

          {/* PRODUCTS */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-x-8 lg:gap-y-14 pb-20 sm:pb-32">
              {products.map((product) => {
                const imageUrl =
                  product.productImages?.length > 0
                    ? product.productImages[0].url
                    : "/snitch_editorial_warm.png";

                return (
                  <div
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="group cursor-pointer flex flex-col"
                  >
                    <div
                      className="aspect-[4/5] overflow-hidden mb-3 sm:mb-6"
                      style={{ backgroundColor: "#f5f3f0" }}
                    >
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h3
                      className="text-sm sm:text-xl group-hover:text-[#C9A96E]"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {product.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs mt-2">
                        {product.price?.currency}{" "}
                        {product.price?.amount?.toLocaleString()}
                      </span>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <h2 className="text-xl">No pieces available</h2>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="border-t py-8 text-center">
          <span className="text-xs uppercase tracking-widest text-[#C9A96E]">
            Outfique © {new Date().getFullYear()}
          </span>
        </footer>
      </div>
    </>
  );
};

export default Home;
