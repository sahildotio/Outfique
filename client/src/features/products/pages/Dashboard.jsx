import React, { useEffect, useMemo, useState } from "react";
import { useProduct } from "../hooks/useProduct";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import SellerCategory from "../components/SellerCategory";

const ease = [0.22, 1, 0.36, 1];

const formatPrice = (amount, currency = "INR") => {
  const n = Number(amount);
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${amount}`;
  }
};

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};

// a product's category can come back as a populated object or a bare id,
// depending on the endpoint — normalize before comparing.
const getCategoryId = (product) =>
  product?.category?._id ?? product?.category ?? null;

const Dashboard = () => {
  const { handleGetSellerProduct, handleDeleteProduct } = useProduct();
  const sellerProducts = useSelector((state) => state.product.sellerProducts);
  const navigate = useNavigate();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    handleGetSellerProduct();
  }, []);

  useEffect(() => {
    document.title = "Seller Dashboard | Outfique";
  });

  // lock scroll + allow Escape while the confirm modal is open
  useEffect(() => {
    if (!deleteTarget) return;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !deleting) setDeleteTarget(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteTarget, deleting]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await handleDeleteProduct(deleteTarget._id);
      await handleGetSellerProduct();
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!sellerProducts) return [];
    if (selectedCategory === "all") return sellerProducts;
    return sellerProducts.filter(
      (product) => getCategoryId(product) === selectedCategory,
    );
  }, [sellerProducts, selectedCategory]);

  const hasAnyProducts = sellerProducts && sellerProducts.length > 0;
  const hasFilteredProducts = filteredProducts.length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-zinc-900 dark:text-white transition-colors px-6 py-10 md:px-16 md:py-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="mb-8"
      >
        <p className="text-xs tracking-[0.28em] uppercase text-zinc-500 dark:text-zinc-400 mb-2">
          Seller Dashboard
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              My Products
            </h1>
            <div className="w-10 h-px bg-zinc-200 dark:bg-white/10 mt-3" />
          </div>
          <button
            onClick={() => navigate("/seller/create-product")}
            className="flex items-center gap-1.5 py-2.5 px-6 rounded-full bg-[#e63b1f] text-white text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-[#ff4f30] cursor-pointer active:scale-95 transition-all duration-200"
          >
            <i className="ri-add-line text-sm" />
            New Product
          </button>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3">
          {hasAnyProducts
            ? `${filteredProducts.length} item${
                filteredProducts.length !== 1 ? "s" : ""
              }${selectedCategory !== "all" ? " in this category" : " in your inventory"}`
            : "0 items in your inventory"}
        </p>
      </motion.div>

      {/* Category filter */}
      {hasAnyProducts && (
        <SellerCategory onCategoryChange={setSelectedCategory} />
      )}

      {/* Empty state: no products at all */}
      {!hasAnyProducts && (
        <div className="flex flex-col items-center justify-center py-32 gap-3 rounded-2xl border border-dashed border-zinc-200 dark:border-white/10">
          <i className="ri-store-2-line text-3xl text-zinc-300 dark:text-zinc-600" />
          <p className="text-zinc-700 dark:text-zinc-300 text-base">
            No products yet
          </p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs tracking-widest uppercase">
            Create your first product to get started
          </p>
        </div>
      )}

      {/* Empty state: no products in the selected category */}
      {hasAnyProducts && !hasFilteredProducts && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease }}
          className="flex flex-col items-center justify-center py-32 gap-3 rounded-2xl border border-dashed border-zinc-200 dark:border-white/10"
        >
          <i className="ri-filter-3-line text-3xl text-zinc-300 dark:text-zinc-600" />
          <p className="text-zinc-700 dark:text-zinc-300 text-base">
            No products in this category
          </p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs tracking-widest uppercase">
            Try another category
          </p>
        </motion.div>
      )}

      {/* Product Grid */}
      {hasFilteredProducts && (
        <motion.div
          key={selectedCategory}
          variants={gridContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                deleting={deleting && deleteTarget?._id === product._id}
                onDeleteClick={() => setDeleteTarget(product)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
              onClick={() => !deleting && setDeleteTarget(null)}
            />
            <motion.div
              key="panel"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-product-title"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease }}
              className="fixed z-[71] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-white/[0.06] shrink-0">
                  {deleteTarget.productImages?.[0]?.url ? (
                    <img
                      src={deleteTarget.productImages[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="ri-image-line text-zinc-300 dark:text-zinc-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    id="delete-product-title"
                    className="text-sm font-semibold text-zinc-900 dark:text-white truncate"
                  >
                    {deleteTarget.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    This action can't be undone
                  </p>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-medium text-zinc-900 dark:text-white">
                  {deleteTarget.title}
                </span>
                ? This will remove it and all its variants from your store.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 h-11 rounded-xl border border-zinc-200 dark:border-white/10 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 h-11 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Product"
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductCard = ({ product, deleting, onDeleteClick }) => {
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const navigate = useNavigate();

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

  return (
    <motion.div
      layout
      variants={cardVariant}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25, ease } }}
      className="relative flex flex-col group rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] overflow-hidden hover:shadow-xl hover:shadow-zinc-900/5 dark:hover:shadow-black/30 transition-shadow duration-500"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {deleting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-black/60 backdrop-blur-[1px]">
          <i className="ri-loader-4-line animate-spin text-xl text-[#e63b1f]" />
        </div>
      )}

      {/* Delete button */}
      <button
        type="button"
        aria-label="Delete product"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteClick();
        }}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 dark:bg-[#141414]/90 backdrop-blur border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:text-rose-400 transition-all duration-200"
      >
        <i className="ri-delete-bin-line text-xs" />
      </button>

      {/* Image */}
      <div
        className="relative overflow-hidden aspect-[3/4] bg-zinc-100 dark:bg-white/[0.06] cursor-pointer"
        onClick={() => navigate(`/seller/product/${product._id}`)}
      >
        {product.productImages?.length > 0 ? (
          <img
            src={product.productImages[imgIndex]?.url}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-zinc-400 dark:text-zinc-600 text-xs tracking-widest uppercase">
              No Image
            </span>
          </div>
        )}

        {product.productImages?.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-white/90 dark:bg-[#141414]/90 text-zinc-700 dark:text-zinc-300 text-[9px] font-medium tracking-[0.1em] uppercase px-2 py-0.5">
            {product.productImages.length} photos
          </span>
        )}
      </div>

      {/* Info */}
      <div
        className="p-3 flex flex-col gap-1.5 flex-1 border-t border-zinc-100 dark:border-white/[0.07] cursor-pointer"
        onClick={() => navigate(`/seller/product/${product._id}`)}
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight line-clamp-1">
            {product.title}
          </h2>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white whitespace-nowrap">
            {formatPrice(product.price?.amount, product.price?.currency)}
          </span>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100 dark:border-white/[0.07]">
          <span className="text-[9px] tracking-[0.12em] uppercase text-zinc-400 dark:text-zinc-500">
            {formattedDate}
          </span>
          <span className="text-[9px] tracking-[0.12em] uppercase text-zinc-400 dark:text-zinc-500">
            {product.price?.currency}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
