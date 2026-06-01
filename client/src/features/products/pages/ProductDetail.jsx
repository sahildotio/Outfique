import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useCart } from "../../cart/hooks/useCart";
import { useProduct } from "../hooks/useProduct";
import { useWishlist } from "../../wishlist/hooks/useWishlist";
import { useSelector } from "react-redux";
import {toast} from "sonner"

const sym = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handleAddToCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const { handleGetProductById } = useProduct();
  const { handleAddWishlist } = useWishlist();
  console.log(handleAddWishlist(productId, product?.variants?.[0]?._id))
  const user = useSelector(state => state.auth.user)
  
  // Fetch product
  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await handleGetProductById(productId);
        const fetchedProduct = data?.product || data;

        setProduct(fetchedProduct);

        if (fetchedProduct?.variants?.length > 0) {
          setSelectedAttributes(fetchedProduct.variants[0].attributes || {});
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    }

    fetchProduct();
  }, [productId]);
  useEffect(() => {
    document.title = product ? `${product.title} - Outfique` : "Product Detail - Outfique";
  })
  // Active Variant Logic (from first code)
  const activeVariant = useMemo(() => {
    if (!product?.variants?.length) return null;

    return product.variants.find((variant) => {
      const vAttrs = variant.attributes || {};
      const vKeys = Object.keys(vAttrs);
      const sKeys = Object.keys(selectedAttributes);

      const isMatch = vKeys.every(
        (key) => selectedAttributes[key] === vAttrs[key],
      );

      return vKeys.length === sKeys.length && isMatch;
    });
  }, [product, selectedAttributes]);

  // Available attribute options
  const attributeOptions = useMemo(() => {
    if (!product?.variants) return {};

    const attrs = {}; 

    product.variants.forEach((variant) => {
      Object.entries(variant.attributes || {}).forEach(([key, value]) => {
        if (!attrs[key]) attrs[key] = new Set();
        attrs[key].add(value);
      });
    });

    Object.keys(attrs).forEach((key) => {
      attrs[key] = Array.from(attrs[key]);
    });

    return attrs;
  }, [product]);

  // Reset image on variant change
  useEffect(() => {
    setActiveImage(0);
  }, [activeVariant]);


  // Better attribute change logic from first code
  const handleAttributeChange = (attrName, value) => {
    const newAttrs = { ...selectedAttributes, [attrName]: value };

    const exactMatch = product.variants.find((variant) => {
      const vAttrs = variant.attributes || {};

      return (
        Object.keys(newAttrs).every((key) => newAttrs[key] === vAttrs[key]) &&
        Object.keys(vAttrs).every((key) => newAttrs[key] === vAttrs[key])
      );
    });

    if (exactMatch) {
      setSelectedAttributes(exactMatch.attributes);
    } else {
      const fallbackVariant = product.variants.find(
        (variant) => variant.attributes?.[attrName] === value,
      );

      if (fallbackVariant) {
        setSelectedAttributes(fallbackVariant.attributes);
      } else {
        setSelectedAttributes(newAttrs);
      }
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f0ede8] flex items-center justify-center">
        <p className="text-xs tracking-[0.25em] uppercase text-[#8a7f6e]">
          Loading...
        </p>
      </div>
    );
  }

  // Variant fallback handling from first code
  const displayImages =
    activeVariant?.productImages?.length > 0
      ? activeVariant.productImages
      : product?.productImages?.length > 0
        ? product.productImages
        : [];

  const displayPrice = activeVariant?.price?.amount
    ? activeVariant.price
    : product.price;

  const currency = sym[displayPrice?.currency] || displayPrice?.currency;

  const nextImage = () =>
    setActiveImage((prev) => (prev + 1) % displayImages.length);

  const prevImage = () =>
    setActiveImage((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1,
    );
  
  const handleCartCheckOption = () => {
    if (!user) {
        toast.error("Please login first to add to cart")
        return 
    }

    handleAddToCart({
      productId: product._id,
      variantId: activeVariant._id
    })
    }
  const handleWishListCheckOption = () => {
    if (!user) {
      toast.error("Please login first to add to wishlist")
      return
    }

    handleAddWishlist({
      productId: product._id,
      variantId: product?.variants?.[0]?._id,
    });
  }


  return (
    <div
      className="min-h-screen bg-[#f0ede8]"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
    >
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-6 md:py-10 lg:py-14">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-[#8a7f6e] hover:text-[#1c1c1c] transition-colors mb-6"
        >
          ← Back
        </button>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-20">
          {/* IMAGE SECTION */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Thumbnails */}
            <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 overflow-hidden border-2 ${
                    activeImage === i
                      ? "border-[#1c1c1c]"
                      : "border-transparent opacity-50"
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative bg-[#e8e4de] w-full max-w-[420px] aspect-[2/3] group overflow-hidden">
              {displayImages.length > 0 && (
                <img
                  src={displayImages[activeImage]?.url}
                  alt={product.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
              )}

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 px-2 py-1"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 px-2 py-1"
                  >
                    →
                  </button>
                </>
              )}
            </div>
          </div>

          {/* DETAILS SECTION */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-[#8a7f6e] mb-2">
                Premium Collection
              </p>
              <h1 className="text-4xl font-light text-[#1c1c1c] mb-3">
                {product.title}
              </h1>
              <div className="w-10 h-px bg-[#c4b99a]" />
            </div>

            {/* Variant UI */}
            {Object.keys(attributeOptions).length > 0 && (
              <div className="flex flex-col gap-6">
                {Object.entries(attributeOptions).map(([attrName, values]) => (
                  <div key={attrName}>
                    {/* Attribute Label */}
                    <p className="text-[11px] tracking-[0.22em] uppercase text-[#7d7568] mb-3 font-medium">
                      {attrName}
                    </p>

                    {/* Variant Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {values.map((value) => {
                        const isSelected =
                          selectedAttributes[attrName] === value;

                        return (
                          <button
                            key={value}
                            onClick={() =>
                              handleAttributeChange(attrName, value)
                            }
                            className={`
                  min-w-[58px]
                  px-5 py-3
                  text-xs uppercase tracking-[0.18em]
                  border transition-all duration-300
                  ${
                    isSelected
                      ? "bg-[#1c1c1c] text-white border-[#1c1c1c]"
                      : "bg-white text-[#1c1c1c] border-[#d8d2c8] hover:border-[#1c1c1c]"
                  }
                `}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Price */}
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#8a7f6e] mb-1">
                Price
              </p>
              <p className="text-3xl font-semibold text-[#1c1c1c]">
                {currency}
                {displayPrice?.amount?.toLocaleString()}
              </p>

              {activeVariant && (
                <p className="text-sm text-[#8a7f6e] mt-2">
                  Stock: {activeVariant.stock}
                </p>
              )}
            </div>

            <div className="w-full h-px bg-[#e0dbd3]" />

            {/* Description */}
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#8a7f6e] mb-3">
                Description
              </p>
              <p className="text-base text-[#8a7f6e] leading-relaxed">
                {product.description}
              </p>
            </div>
            {/* wishlist */}
            <button
              className="
      w-12
      h-12
      rounded-full
      bg-white
      border
      border-gray-200
      shadow-sm
      flex
      items-center
      justify-center
      hover:shadow-lg
      hover:scale-110
      transition-all
      duration-300
      cursor-pointer
      active:scale-95
    "
              onClick={() => {
                handleWishListCheckOption()
              }}
            >
              {" "}
              <i className="ri-heart-line text-xl text-[#1b1c1a]"></i>
            </button>
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() =>
                  handleCartCheckOption()
                }
                className="flex-1 py-4 bg-[#1c1c1c] text-white text-xs tracking-[0.25em] uppercase hover:bg-[#333] hover:border hover:border-[#1c1c1c] hover:text-[#e1e1e1] transition-all active:scale-95 cursor-pointer"
              >
                Add to Cart
              </button>

              <button
                className="flex-1 py-4 border border-[#1c1c1c] text-[#1c1c1c] text-xs tracking-[0.25em] uppercase hover:bg-[#eeeeee] active:scale-95 cursor-pointer transition-all"
                onClick={() => {
                  navigate("/cart");
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
