import { useCart } from "@/features/cart/hooks/useCart";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useWishlist } from "../hooks/useWishlist";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const Wishlist = () => {
  const { handleGetWishlist, handleDeleteWishlist } = useWishlist();
  const [wishlistData, setWishlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState({});
  const [movingIds, setMovingIds] = useState({});

  // size-picker modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [confirmingMove, setConfirmingMove] = useState(false);

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

  const openSizeModal = (item) => {
    setSelectedItem(item);
    setSelectedSize(null);
    setIsSizeModalOpen(true);
  };

  const closeSizeModal = () => {
    setIsSizeModalOpen(false);
    setSelectedItem(null);
    setSelectedSize(null);
  };

  const handleMoveToBag = async (item, size) => {
    try {
      setMovingIds((prev) => ({ ...prev, [item._id]: true }));
      await handleAddToCart(item.productId._id, item.variantId, size);
      const res = await handleDeleteWishlist(
        item.productId._id,
        item.variantId,
      );
      if (res?.success) {
        setWishlistData((prev) => prev.filter((i) => i._id !== item._id));
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setMovingIds((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  const confirmMoveToBag = async () => {
    if (!selectedItem || !selectedSize) return;
    setConfirmingMove(true);
    await handleMoveToBag(selectedItem, selectedSize);
    setConfirmingMove(false);
    closeSizeModal();
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
      setRemovingIds((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  // resolve the variant + sizes for whichever item currently has the modal open
  const selectedProduct = selectedItem?.productId;
  const selectedVariant =
    selectedProduct?.variants?.find((v) => v._id === selectedItem?.variantId) ||
    selectedProduct?.variants?.[0];
  const selectedImage =
    selectedVariant?.productImages?.[0]?.url ||
    selectedProduct?.productImages?.[0]?.url;
  const availableSizes = selectedVariant?.attributes?.size || [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-5 text-lg font-medium text-zinc-900 dark:text-white sm:mb-6 sm:text-xl">
        Wishlist
      </h1>

      {loading ? (
        <div className="flex flex-col gap-3 sm:gap-4">
          {[...Array(3)].map((_, i) => (
            <WishlistItemSkeleton key={i} />
          ))}
        </div>
      ) : !wishlistData?.length ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-white/10">
          <i className="ri-heart-3-line text-3xl text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
                moving={!!movingIds[item._id]}
                onRemove={handleRemove}
                onSelectSize={openSizeModal}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Size picker — shown before an item actually moves to the cart */}
      <Dialog
        open={isSizeModalOpen}
        onOpenChange={(open) => {
          if (!open) closeSizeModal();
        }}
      >
        <DialogContent className="rounded-2xl border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white">
              Select a size
            </DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400">
              Choose a size to add this item to your bag.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 py-1">
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-white/[0.06] shrink-0">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={selectedProduct?.title || "Product image"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-zinc-200 dark:bg-white/[0.08]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                {selectedProduct?.title}
              </p>
              {selectedVariant?.attributes?.color && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {selectedVariant.attributes.color}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 py-2">
            {availableSizes.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No sizes available for this item.
              </p>
            ) : (
              availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selectedSize === size}
                  className={`h-10 min-w-10 px-3 rounded-lg text-sm font-medium border transition-colors duration-150 ${
                    selectedSize === size
                      ? "bg-[#e63b1f] text-white border-[#e63b1f]"
                      : "border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-white/30"
                  }`}
                >
                  {size}
                </button>
              ))
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={closeSizeModal}
              className="h-10 px-4 rounded-xl border border-zinc-200 dark:border-white/10 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmMoveToBag}
              disabled={!selectedSize || confirmingMove}
              className="h-10 px-4 rounded-xl bg-[#e63b1f] text-white text-sm font-semibold hover:bg-[#ff4f30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {confirmingMove ? "Adding..." : "Add to Bag"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const WishlistItemCard = ({
  item,
  removing,
  onRemove,
  moving,
  onSelectSize,
}) => {
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
      className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#141414] sm:gap-5 sm:p-4"
    >
      <div className="relative w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/[0.06] sm:w-28 md:w-32">
        <div className="aspect-[3/4] w-full">
          {image ? (
            <img
              src={image}
              alt={product?.title || "Product image"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-zinc-200 dark:bg-white/[0.08]" />
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
            <h3 className="truncate text-sm font-medium text-zinc-900 dark:text-white sm:text-base">
              {product?.title}
            </h3>
            {color && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                {color}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label="Remove from wishlist"
            className="shrink-0 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e63b1f]/50 cursor-pointer dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-200"
          >
            <i className="ri-delete-bin-line text-[18px]" />
          </button>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <motion.button
            onClick={() => onSelectSize(item)}
            type="button"
            disabled={outOfStock || moving}
            whileTap={
              prefersReducedMotion || outOfStock || moving
                ? {}
                : { scale: 0.96 }
            }
            className="text-xs font-semibold uppercase tracking-wide text-zinc-900 underline decoration-1 underline-offset-4 transition-colors hover:text-[#e63b1f] disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:text-zinc-300 disabled:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e63b1f]/50 dark:text-white dark:disabled:text-zinc-600 dark:disabled:hover:text-zinc-600 sm:text-sm"
          >
            {moving ? "Moving..." : outOfStock ? "Unavailable" : "Move to bag"}
          </motion.button>

          <span className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
            {formattedPrice}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const WishlistItemSkeleton = () => (
  <div className="flex animate-pulse gap-4 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-[#141414] sm:gap-5 sm:p-4">
    <div className="w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/[0.06] sm:w-28 md:w-32">
      <div className="aspect-[3/4] w-full" />
    </div>
    <div className="flex flex-1 flex-col justify-between py-1">
      <div className="space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-zinc-100 dark:bg-white/[0.06]" />
        <div className="h-3 w-1/4 rounded bg-zinc-100 dark:bg-white/[0.06]" />
      </div>
      <div className="flex items-end justify-between">
        <div className="h-3 w-20 rounded bg-zinc-100 dark:bg-white/[0.06]" />
        <div className="h-4 w-14 rounded bg-zinc-100 dark:bg-white/[0.06]" />
      </div>
    </div>
  </div>
);

export default Wishlist;
