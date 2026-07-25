import { useEffect, useRef, useState } from "react";
import { useProduct } from "../hooks/useProduct";
import { useNavigate } from "react-router";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const DEFAULT_FILTER = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sort: "",
};

const ProductCard = ({ product, wishlisted, onToggleWishlist }) => {
  const image = product?.productImages?.[0]?.url;
  const colors = (product?.variants ?? [])
    .map((v) => v?.attributes?.color)
    .filter(Boolean);
  const navigate = useNavigate();

  return (
    <div className="group flex flex-col">
      {/* image — full width so cards line up cleanly in the grid */}
      <div
        onClick={() => {
          navigate(
            `/product/${product?.category?.slug}/${product?.productSlug}`,
          );
        }}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-stone-100 dark:bg-zinc-900 cursor-pointer"
      >
        <img
          src={image}
          alt={product?.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:-translate-y-2"
          draggable={false}
        />

        {/* subtle scrim on hover, just enough to lift the heart icon */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

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

        {/* color swatches — bottom-left overlay on hover */}
        {colors.length > 0 && (
          <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center gap-1.5 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
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

      {/* info block — always visible, aligned in a fixed order under the image */}
      <div className="mt-3 flex flex-col gap-0.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
          {product?.category?.name}
        </p>
        <h3 className="text-[15px] font-medium leading-snug text-gray-900 dark:text-white">
          {product?.title}
        </h3>
        <span className="mt-0.5 text-[14px] font-semibold text-gray-900 dark:text-white">
          {formatPrice(product?.price?.amount)}
        </span>
      </div>
    </div>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────
const ProductCardSkeleton = () => (
  <div className="flex flex-col gap-3">
    <div className="aspect-[3/4] w-full animate-pulse rounded-3xl bg-gray-200 dark:bg-zinc-800" />
    <div className="flex flex-col gap-2">
      <div className="h-2.5 w-16 animate-pulse rounded-full bg-stone-100 dark:bg-zinc-800" />
      <div className="h-3.5 w-32 animate-pulse rounded-full bg-stone-100 dark:bg-zinc-800" />
      <div className="h-3.5 w-14 animate-pulse rounded-full bg-stone-100 dark:bg-zinc-800" />
    </div>
  </div>
);

// ── Filter bar ─────────────────────────────────────────────────────────────
const inputClass =
  "h-10 rounded-full border-stone-200 dark:border-zinc-800 bg-transparent focus-visible:ring-1 focus-visible:ring-stone-900 dark:focus-visible:ring-white";

const FilterBar = ({ filter, onChange, onClear, categories, hasActiveFilters }) => {
  return (
    <div className="mb-8 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Input
          placeholder="Search products..."
          value={filter.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className={`flex-1 min-w-0 ${inputClass}`}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filter.category || "all"}
            onValueChange={(value) =>
              onChange({ category: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className={`w-full sm:w-40 ${inputClass}`}>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Min ₹"
              value={filter.minPrice}
              onChange={(e) => onChange({ minPrice: e.target.value })}
              className={`w-24 ${inputClass}`}
            />
            <span className="text-stone-400 text-xs">to</span>
            <Input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Max ₹"
              value={filter.maxPrice}
              onChange={(e) => onChange({ maxPrice: e.target.value })}
              className={`w-24 ${inputClass}`}
            />
          </div>

          <Select
            value={filter.sort || "recommended"}
            onValueChange={(value) =>
              onChange({ sort: value === "recommended" ? "" : value })
            }
          >
            <SelectTrigger className={`w-full sm:w-44 ${inputClass}`}>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium uppercase tracking-[0.08em] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white underline underline-offset-4 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Product Grid ──────────────────────────────────────────────────────────
export const Product = ({ products: initialProducts }) => {
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [wishlist, setWishlist] = useState({});
  const [categories, setCategories] = useState([]);
  const { handleGetAllProducts, handleGetAllCategory } = useProduct();

  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [debouncedFilter, setDebouncedFilter] = useState(DEFAULT_FILTER);

  // avoid stomping a newer response with a stale, slower one
  const requestIdRef = useRef(0);

  const updateFilter = (patch) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  };

  const clearFilters = () => setFilter(DEFAULT_FILTER);

  const hasActiveFilters = Object.entries(filter).some(
    ([key, value]) => value !== DEFAULT_FILTER[key],
  );

  // debounce all filter changes (search keystrokes and price typing especially)
  // before they trigger a network request
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilter(filter), 400);
    return () => clearTimeout(timer);
  }, [filter]);

  const fetchProducts = async (activeFilter) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await handleGetAllProducts(activeFilter);
      // ignore this response if a newer request has since been fired
      if (requestId !== requestIdRef.current) return;
      setProducts(res ?? []);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialProducts) {
      fetchProducts(debouncedFilter);
    }
  }, [debouncedFilter]);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setLoading(false);
    }
  }, [initialProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await handleGetAllCategory();
        setCategories(res || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const { handleAddWishlist } = useWishlist();

  const toggleWishlist = async (productId, variantId) => {
    try {
      await handleAddWishlist(productId, variantId);
      setWishlist((prev) => ({
        ...prev,
        [productId]: !prev[productId],
      }));
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    document.title = "Men's Fashion | Premium Clothing & Accessories";
  });

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-6 lg:px-12 transition-colors duration-300">
      {!initialProducts && (
        <FilterBar
          filter={filter}
          onChange={updateFilter}
          onClear={clearFilters}
          categories={categories}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
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
          {hasActiveFilters
            ? "No products match your filters."
            : "No products to show yet."}
        </p>
      )}
    </div>
  );
};

export default Product;