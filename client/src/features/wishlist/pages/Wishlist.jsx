import { useCart } from "@/features/cart/hooks/useCart";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HeartOff, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useWishlist } from "../hooks/useWishlist";
import { useSelector } from "react-redux";

const Wishlist = () => {
  const { handleGetWishlist, handleDeleteWishlist } = useWishlist();
  const [wishlistData, setWishlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState({});
  const [moveToBag, setMoveToBag] = useState({})

  const product = useSelector((state) => state.product.products);
  console.log(product)

  const fetchWishListData = async () => {
    const res = await handleGetWishlist();
    setWishlistData(res);
  };

  useEffect(() => {
    fetchWishListData();
  }, []);

  useEffect(() => {
    if (wishlistData) setLoading(false);
  }, [wishlistData]);

  const { handleAddToCart } = useCart();

  const handleMoveToBag = async (productId, variantId) => {
    try {
      await handleAddToCart(productId, variantId);
      setMoveToBag((prev) => ({...prev, [productId]: !prev[productId]}))
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleRemove = async (item) => {
    try {
      setRemovingIds((prev) => ({ ...prev, [item._id]: true }));

      const res = await handleDeleteWishlist(
        item.productId._id,
        item.variantId,
      );

      if (res.success) {
        setWishlistData((prev) => prev.filter((i) => i._id !== item._id));
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setRemovingIds((prev) => ({ ...prev, [item._id]: true }));
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-5 text-lg font-medium text-stone-900 dark:text-zinc-100 sm:mb-6 sm:text-xl">
        Wishlist
      </h1>

      {loading ? (
        <div className="flex flex-col gap-3 sm:gap-4">
          {[...Array(3)].map((_, i) => (
            <WishlistItemSkeleton key={i} />
          ))}
        </div>
      ) : !wishlistData?.length ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-200 py-16 text-center dark:border-zinc-800">
          <HeartOff
            size={28}
            strokeWidth={1.5}
            className="text-stone-300 dark:text-zinc-600"
          />
          <p className="text-sm text-stone-500 dark:text-zinc-400">
            Your wishlist is empty
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          <AnimatePresence initial={false}>
            {wishlistData.map((item) => (
              <WishlistItemCard
                key={item._id}
                item={item}
                removing={!!removingIds[item._id]}
                onRemove={handleRemove}
                moveToBag={handleMoveToBag}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const WishlistItemCard = ({ item, removing, onRemove, moveToBag }) => {
  const prefersReducedMotion = useReducedMotion();
  const product = item?.productId;
  const variant =
    product?.variants?.find((v) => v._id === item?.variantId) ||
    product?.variants?.[0];

  const image =
    variant?.productImages?.[0]?.url || product?.productImages?.[0]?.url;

  const color = variant?.attributes?.color;
  const price = variant?.price?.amount ?? product?.price?.amount;
  const currency =
    variant?.price?.currency ?? product?.price?.currency ?? "INR";
  const outOfStock = variant?.stock === 0;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price ?? 0);

  return (
    <motion.div
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={
        removing
          ? { opacity: 0, scale: 0.97, transition: { duration: 0.2 } }
          : { opacity: 1, y: 0 }
      }
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:gap-5 sm:p-4"
    >
      <div className="relative w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-zinc-800 sm:w-28 md:w-32">
        <div className="aspect-[3/4] w-full">
          {image ? (
            <img
              src={image}
              alt={product?.title || "Product image"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-stone-200 dark:bg-zinc-700" />
          )}
        </div>
        {outOfStock && (
          <div className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center text-[10px] font-medium uppercase tracking-wide text-white">
            Out of stock
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-stone-900 dark:text-zinc-100 sm:text-base">
              {product?.title}
            </h3>
            {color && (
              <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400 sm:text-sm">
                {color}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label="Remove from wishlist"
            className="shrink-0 rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 cursor-pointer dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <Trash2 size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <motion.button
            onClick={() => moveToBag(product._id, variant._id)}
            type="button"
            disabled={outOfStock}
            whileTap={prefersReducedMotion || outOfStock ? {} : { scale: 0.96 }}
            className="text-xs font-semibold uppercase tracking-wide text-stone-900 underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:text-stone-300 disabled:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 dark:text-zinc-100 dark:disabled:text-zinc-600 sm:text-sm"
          >
            {outOfStock ? "Unavailable" : "Move to bag"}
          </motion.button>

          <span className="text-sm font-semibold text-stone-900 dark:text-zinc-100 sm:text-base">
            {formattedPrice}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const WishlistItemSkeleton = () => (
  <div className="flex animate-pulse gap-4 rounded-2xl border border-stone-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 sm:gap-5 sm:p-4">
    <div className="w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-zinc-800 sm:w-28 md:w-32">
      <div className="aspect-[3/4] w-full" />
    </div>
    <div className="flex flex-1 flex-col justify-between py-1">
      <div className="space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-stone-200 dark:bg-zinc-800" />
        <div className="h-3 w-1/4 rounded bg-stone-200 dark:bg-zinc-800" />
      </div>
      <div className="flex items-end justify-between">
        <div className="h-3 w-20 rounded bg-stone-200 dark:bg-zinc-800" />
        <div className="h-4 w-14 rounded bg-stone-200 dark:bg-zinc-800" />
      </div>
    </div>
  </div>
);

export default Wishlist;
