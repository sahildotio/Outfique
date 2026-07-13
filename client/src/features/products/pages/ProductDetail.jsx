import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import {
  FacebookIcon,
  FacebookShareButton,
  TelegramIcon,
  TelegramShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import Product from "../components/Product";
import { useProduct } from "../hooks/useProduct";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const ease = [0.22, 1, 0.36, 1];

const ProductDetail = () => {
  const { slug, productSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [allProduct, setAllProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wishlist, setWishlist] = useState({});

  const { handleGetProductDetailBySlug, handleGetProductBySlug } = useProduct();
  const { handleAddWishlist } = useWishlist();

  const toggleWishlist = async (productId, variantId) => {
    await handleAddWishlist(productId, variantId)
    setWishlist(prev => ({...prev, [productId]: !prev[productId] }))
  };

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await handleGetProductDetailBySlug(slug, productSlug);
      setProduct(res);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProductBySlug = async () => {
    const res = await handleGetProductBySlug(slug);
    setAllProduct(res);
  };

  useEffect(() => {
    if (slug) {
      fetchAllProductBySlug();
    }
  }, []);

  useEffect(() => {
    if (slug && productSlug) {
      fetchData();
    }
  }, [slug, productSlug]);

  useEffect(() => {
    document.title = product?.title
      ? `Buy ${product.title} | YourStore`
      : "Loading...";
  }, [product]);

  if (loading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-stone-500 dark:text-stone-400">
        We couldn't find this product.
      </div>
    );
  }

  return <ProductDetailView product={product} allProduct={allProduct} toggleWishList={toggleWishlist} />;
};

function ProductDetailView({ product, allProduct, toggleWishList, wishlist }) {
  const reduceMotion = useReducedMotion();
  const variants = product.variants || [];
  const [shareOpen, setShareOpen] = useState(false);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeSize, setActiveSize] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);
  const thumbColRef = useRef(null);

  const activeVariant = variants[activeVariantIdx];

  const images = useMemo(() => {
    if (activeVariant?.productImages?.length)
      return activeVariant.productImages;
    return product.productImages || [];
  }, [activeVariant, product.productImages]);

  const activeImage = images[activeImageIdx] || images[0];

  const handleSelectVariant = (idx) => {
    setActiveVariantIdx(idx);
    setActiveImageIdx(0);
    setActiveSize(null);
  };

  const goPrev = () =>
    setActiveImageIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () =>
    setActiveImageIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  const sizes = activeVariant?.attributes?.size || [];

  const relatedProducts = useMemo(() => {
    return allProduct.filter((item) => item._id !== product._id);
  }, [allProduct, product._id]);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[88px_1fr_1fr] gap-4 lg:gap-8">
          {/* Thumbnails */}
          <div
            ref={thumbColRef}
            className="order-2 lg:order-1 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible"
          >
            {images.map((img, idx) => (
              <button
                key={img._id}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative shrink-0 w-16 h-20 sm:w-20 sm:h-24 lg:w-full lg:h-24 rounded-xl overflow-hidden ring-1 transition-all duration-300 ${
                  idx === activeImageIdx
                    ? "ring-2 ring-stone-900 dark:ring-white"
                    : "ring-stone-200 dark:ring-stone-800 hover:ring-stone-400 dark:hover:ring-stone-600"
                }`}
                aria-label={`View image ${idx + 1}`}
                aria-current={idx === activeImageIdx}
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage?._id}
                  src={activeImage?.url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  initial={reduceMotion ? {} : { opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? {} : { opacity: 0 }}
                  transition={{ duration: 0.45, ease }}
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-stone-950/80 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:focus-visible:ring-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-stone-950/80 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:focus-visible:ring-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <motion.div
            className="order-3 lg:sticky lg:top-8 lg:self-start"
            initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium tracking-[0.15em] text-stone-500 dark:text-stone-400 uppercase">
                New Arrival
              </span>

              <div className="relative">
                <button
                  onClick={() => setShareOpen((prev) => !prev)}
                  aria-label="Share product"
                  className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {shareOpen && (
                  <div className="absolute right-0 top-8 z-50 w-60 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl p-4">
                    <h3 className="mb-3 text-sm font-semibold text-stone-900 dark:text-white">
                      Share Product
                    </h3>

                    <div className="flex items-center justify-between">
                      <WhatsappShareButton
                        url={window.location.href}
                        title={product.title}
                      >
                        <WhatsappIcon size={42} round />
                      </WhatsappShareButton>

                      <FacebookShareButton url={window.location.href}>
                        <FacebookIcon size={42} round />
                      </FacebookShareButton>

                      <TelegramShareButton
                        url={window.location.href}
                        title={product.title}
                      >
                        <TelegramIcon size={42} round />
                      </TelegramShareButton>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          setShareOpen(false);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition"
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
              {product.title}
            </h1>

            <p className="mt-2 text-lg font-medium">
              {formatINR(activeVariant?.price?.amount ?? product.price?.amount)}
            </p>

            <div className="mt-6 h-px bg-stone-200 dark:bg-stone-800" />

            {/* Variant (image-based, color swatches removed) */}
            {variants.length > 1 && (
              <div className="mt-8">
                <span className="text-xs font-medium tracking-[0.1em] uppercase text-stone-500 dark:text-stone-400">
                  Variant
                </span>
                <div className="mt-3 flex gap-2.5">
                  {variants.map((v, idx) => {
                    const variantImage = v.productImages?.[0]?.url;
                    return (
                      <button
                        key={v._id}
                        onClick={() => handleSelectVariant(idx)}
                        aria-label={`Select variant ${idx + 1}`}
                        aria-pressed={idx === activeVariantIdx}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden ring-1 ring-offset-2 ring-offset-white dark:ring-offset-stone-950 transition-all duration-300 ${
                          idx === activeVariantIdx
                            ? "ring-2 ring-stone-900 dark:ring-white scale-105"
                            : "ring-stone-300 dark:ring-stone-700 hover:ring-stone-500"
                        }`}
                      >
                        {variantImage ? (
                          <img
                            src={variantImage}
                            alt={`Variant ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-500">
                            {idx + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size */}
            {sizes.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium tracking-[0.1em] uppercase text-stone-500 dark:text-stone-400">
                    Size
                  </span>
                  <button className="text-xs font-medium underline underline-offset-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
                    Size Guide
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setActiveSize(size)}
                      className={`h-11 rounded-xl text-sm font-medium border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:focus-visible:ring-white ${
                        activeSize === size
                          ? "bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900 dark:border-white"
                          : "border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to bag */}
            <div className="mt-8 flex gap-3">
              <motion.button
                whileTap={reduceMotion ? {} : { scale: 0.98 }}
                disabled={sizes.length > 0 && !activeSize}
                className="flex-1 h-13 py-3.5 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-stone-900 text-sm font-medium tracking-wide hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-900 dark:focus-visible:ring-white"
                onClick={() => console.log("Hello world")}
              >
                Add to Bag
              </motion.button>
              <button
                onClick={() => toggleWishList(product._id, activeVariant?._id)}
                aria-label={
                  wishlist?.[product._id]
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                aria-pressed={wishlist?.[product._id]}
                className="w-13 h-13 aspect-square rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-center hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
              >
                <Heart
                  className={`w-4.5 h-4.5 transition-colors ${
                    wishlist?.[product._id]
                      ? "fill-rose-500 text-rose-500"
                      : "text-stone-700 dark:text-stone-300"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <Truck className="w-3.5 h-3.5" />
              Free express shipping on orders over ₹5,000
            </div>

            {/* Accordions */}
            <div className="mt-8 border-t border-stone-200 dark:border-stone-800">
              <Accordion
                label="Details & Composition"
                open={detailsOpen}
                onToggle={() => setDetailsOpen((o) => !o)}
              >
                {product.description ||
                  "Composition and construction details for this piece."}
              </Accordion>
              <Accordion
                label="Care Instructions"
                open={careOpen}
                onToggle={() => setCareOpen((o) => !o)}
              >
                {product.careInstructions ||
                  "Machine wash cold with like colors. Do not bleach. Tumble dry low. Warm iron if needed."}
              </Accordion>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="w-full mb-10"></div>
      <div className="flex flex-col gap-5 px-4">
        <Product products={relatedProducts} />
      </div>
    </div>
  );
}

function Accordion({ label, open, onToggle, children }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="border-b border-stone-200 dark:border-stone-800">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left focus:outline-none"
        aria-expanded={open}
      >
        <span className="text-xs font-medium tracking-[0.1em] uppercase">
          {label}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease }}
        >
          <ChevronDown className="w-4 h-4 text-stone-500" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduceMotion ? {} : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {children}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-stone-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[88px_1fr_1fr] gap-4 lg:gap-8 animate-pulse">
          <div className="order-2 lg:order-1 flex lg:flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-20 sm:w-20 sm:h-24 lg:w-full lg:h-24 rounded-xl bg-stone-100 dark:bg-stone-900"
              />
            ))}
          </div>
          <div className="order-1 lg:order-2 aspect-[3/4] w-full rounded-2xl bg-stone-100 dark:bg-stone-900" />
          <div className="order-3 space-y-4">
            <div className="h-3 w-20 rounded bg-stone-100 dark:bg-stone-900" />
            <div className="h-7 w-3/4 rounded bg-stone-100 dark:bg-stone-900" />
            <div className="h-5 w-24 rounded bg-stone-100 dark:bg-stone-900" />
            <div className="h-px w-full bg-stone-100 dark:bg-stone-900 mt-6" />
            <div className="h-16 w-full rounded bg-stone-100 dark:bg-stone-900" />
            <div className="h-8 w-40 rounded-full bg-stone-100 dark:bg-stone-900 mt-6" />
            <div className="h-11 w-full rounded-xl bg-stone-100 dark:bg-stone-900 mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
