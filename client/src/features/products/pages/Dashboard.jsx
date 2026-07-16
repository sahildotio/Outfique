import React, { useEffect, useState } from "react";
import { useProduct } from "../hooks/useProduct";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const { handleGetSellerProduct } = useProduct();
  const sellerProducts = useSelector((state) => state.product.sellerProducts);
  const navigate = useNavigate();

  useEffect(() => {
    handleGetSellerProduct();
  }, []);

  useEffect(() => {
    document.title = "Seller Dashboard | Outfique";
  })

  return (
    <div
      className="min-h-screen bg-[#f0ede8] px-6 py-10 md:px-16 md:py-14"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
    >
      {/* Header */}
      <div className="mb-14">
        <p className="text-[0.65rem] tracking-[0.28em] uppercase text-[#8a7f6e] mb-2">
          Seller Dashboard
        </p>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-wide text-[#1c1c1c] mb-1">
              My Products
            </h1>
            <div className="w-10 h-px bg-[#c4b99a] mt-3" />
          </div>
          <button
            onClick={() => navigate("/seller/create-product")}
            className="py-2.5 px-8 bg-[#1c1c1c] text-[#f0ede8] text-[0.65rem] tracking-[0.3em] uppercase hover:bg-[#3a3a3a] transition-colors duration-300 cursor-pointer"
          >
            + New Product
          </button>
        </div>
        <p className="text-[#8a7f6e] text-base mt-3 font-light">
          {sellerProducts?.length ?? 0} item
          {sellerProducts?.length !== 1 ? "s" : ""} in your inventory
        </p>
      </div>

      {/* Empty State */}
      {(!sellerProducts || sellerProducts.length === 0) && (
        <div className="flex flex-col items-center justify-center py-32 gap-4 border border-dashed border-[#c4b99a]">
          <p className="text-[#8a7f6e] text-lg tracking-wide">
            No products yet
          </p>
          <p className="text-[#b5aa96] text-sm tracking-widest uppercase">
            Create your first product to get started
          </p>
        </div>
      )}

      {/* Product Grid */}
      {sellerProducts && sellerProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sellerProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const navigate = useNavigate();
  // Cycle to second image on hover if available
  useEffect(() => {
    if (hovered && product.productImages?.length > 1) {
      setImgIndex(1);
    } else {
      setImgIndex(0);
    }
  }, [hovered]);

  const formattedDate = new Date(product.createdAt).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );

  const currencySymbol = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const symbol =
    currencySymbol[product.price?.currency] ?? product.price?.currency;

  return (
    <div
      className="bg-[#f0ede8] flex flex-col w-[350px] h-[500px] group cursor-pointer border border-[#ddd8d0] hover:border-[#1c1c1c] hover:shadow-[0_8px_32px_rgba(28,28,28,0.10)] transition-all duration-500"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden aspect-[3/4] bg-[#e8e4de]"
        onClick={() => {
          navigate(`/seller/product/${product._id}`);
        }}
      >
        {product.productImages?.length > 0 ? (
          <img
            src={product.productImages[imgIndex]?.url}
            alt={product.title}
            className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#b5aa96] text-xs tracking-widest uppercase">
              No Image
            </span>
          </div>
        )}

        {/* Image count badge */}
        {product.productImages?.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-[#f0ede8]/90 text-[#1c1c1c] text-[0.58rem] tracking-[0.15em] uppercase px-2 py-1">
            {product.productImages.length} photos
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-3 flex-1 border-t border-[#c4b99a]">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-wide text-[#1c1c1c] leading-tight">
            {product.title}
          </h2>
          <span className="text-lg font-semibold text-[#1c1c1c] whitespace-nowrap">
            {symbol}
            {product.price?.amount?.toLocaleString()}
          </span>
        </div>

        <p className="text-sm text-[#8a7f6e] font-light leading-relaxed line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[#e0dbd3]">
          <span className="text-[0.6rem] tracking-[0.18em] uppercase text-[#b5aa96]">
            {formattedDate}
          </span>
          <span className="text-[0.6rem] tracking-[0.18em] uppercase text-[#b5aa96]">
            {product.price?.currency}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
