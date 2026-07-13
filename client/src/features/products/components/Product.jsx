import { useEffect, useState } from "react";
import { useProduct } from "../hooks/useProduct";
import { useNavigate } from "react-router";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";

// ── Heart / Wishlist Icon ────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg
    className="w-5 h-5 transition-all duration-200"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    />
  </svg>
);

const formatPrice = (amount) =>
  `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;

const ProductCard = ({ product, wishlisted, onToggleWishlist }) => {
  const image = product?.productImages?.[0]?.url;
  const colors = (product?.variants ?? [])
    .map((v) => v?.attributes?.color)
    .filter(Boolean);
  const navigate = useNavigate()

  return (
    <div className="group flex flex-col gap-3">
      <div
        onClick={() => {
          navigate(`/product/${product?.category?.slug}/${product?.productSlug}`);
        }}
        className="relative aspect-[3/4] w-[75%] overflow-hidden rounded-3xl dark:bg-zinc-900 bg-stone-100 cursor-pointer"
      >
        <img
          src={image}
          alt={product?.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:-translate-y-2"
          draggable={false}
        />

        {/* bottom-up scrim */}
        <div
          className="pointer-events-none absolute inset-0
bg-gradient-to-t
from-black/70
via-black/10
to-transparent
opacity-0
transition-opacity
duration-500
group-hover:opacity-100"
        />

        {/* wishlist */}
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(product._id, product?.variants?.[0]?._id);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 hover:rotate-6 cursor-pointer"
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {/* price + swatches — slide up from below the fold */}
        <div className="absolute inset-x-3 bottom-3 flex translate-y-4 items-center justify-between opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-[14px] font-semibold text-white">
            {formatPrice(product?.price?.amount)}
          </span>
          {colors.length > 0 && (
            <div className="flex items-center gap-1.5">
              {colors.map((color, i) => (
                <span
                  key={`${product._id}-swatch-${i}`}
                  className="h-3.5 w-3.5 rounded-full ring-1 ring-white/70"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* title stays visible at all times */}
      <div className="flex flex-col gap-0.5 px-1">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.12em]
text-gray-500 dark:text-gray-400"
        >
          {product?.category?.name}
        </p>
        <h3
          className="text-[15px] font-medium leading-snug
text-gray-900 dark:text-white"
        >
          {product?.title}
        </h3>
      </div>
    </div>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────
const ProductCardSkeleton = () => (
  <div className="flex flex-col gap-3">
    <div className="aspect-[3/4] w-full animate-pulse rounded-3xl bg-gray-200 dark:bg-zinc-800" />
    <div className="flex flex-col gap-2 px-1">
      <div className="h-2.5 w-16 animate-pulse rounded-full bg-stone-100" />
      <div className="h-3.5 w-32 animate-pulse rounded-full bg-stone-100" />
    </div>
  </div>
);

// ── Product Grid ──────────────────────────────────────────────────────────
export const Product = ({products: initialProducts}) => {
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [wishlist, setWishlist] = useState({});
  const { handleGetAllProducts } = useProduct();

  const fetchProducts = async () => {
    setLoading(true);
    const res = await handleGetAllProducts();
    setProducts(res ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!initialProducts) {
      fetchProducts();
    }
  }, [initialProducts]);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setLoading(false)
    }
  }, [initialProducts]);

  const { handleAddWishlist } = useWishlist();

  const toggleWishlist = async (productId, variantId) => {
    try{
      await handleAddWishlist(productId, variantId)
      setWishlist((prev) => ({
        ...prev,
        [productId]: !prev[productId],
      }))
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
      document.title = "Men's Fashion | Premium Clothing & Accessories";
  })
  
  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-6 lg:px-12 transition-colors duration-300">
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                wishlisted={!!wishlist[product._id]}
                onToggleWishlist={toggleWishlist}
              />
            ))}
      </div>

      {!loading && products.length === 0 && (
        <p className="py-20 text-center text-sm text-gray-500 dark:text-gray-400">
          No products to show yet.
        </p>
      )}
    </div>
  );
};

export default Product;
