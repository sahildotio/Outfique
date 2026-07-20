import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useProduct } from "../hooks/useProduct";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const ease = [0.22, 1, 0.36, 1];

const ATTRIBUTE_KEYS = [
  "color",
  "size",
  "material",
  "style",
  "weight",
  "length",
  "width",
  "height",
];

// size is the one attribute whose value is an array ("size": ["M","XS","L"])
// rather than a single string — everything else stays plain text.
// Two separate size systems: clothing sizes vs shoe sizes, toggled via `sizeType`.
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12"];
const PANT_SIZES = [
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "48",
  "50",
];

const inputClass =
  "rounded-xl border-stone-200 dark:border-stone-800 bg-transparent focus-visible:ring-1 focus-visible:ring-stone-900 dark:focus-visible:ring-white";

const formatPrice = (amount, currency = "INR") => {
  const n = Number(amount);
  if (Number.isNaN(n)) return amount ?? "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${amount}`;
  }
};

// server has been seen returning variant.price as either a plain number/string
// or a nested { amount } object — normalize here rather than in the JSX.
const getVariantAmount = (variant) => variant?.price?.amount ?? variant?.price;

const SellerProductDetail = () => {
  const reduceMotion = useReducedMotion();
  const {
    handleAddProductVariants,
    handleGetProductById,
    handleDeleteVariant,
  } = useProduct();
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Which size system is currently active for the "size" attribute picker.
  const [sizeType, setSizeType] = useState("clothing");

  const [newVariant, setNewVariant] = useState({
    stock: "",
    price: { amount: "" },
    attributes: [{ key: "", value: "" }],
    productImages: [],
  });

  // delete-variant confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await handleGetProductById(productId);
        setProduct(data);
        setVariants(data?.variants || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

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

  const handleAttributes = () => {
    setNewVariant((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: "", value: "" }],
    }));
  };

  const handleAttributesChange = (index, field, value) => {
    const updated = [...newVariant.attributes];
    updated[index][field] = value;
    setNewVariant((prev) => ({ ...prev, attributes: updated }));
  };

  // switching the key needs to reset value to the right shape:
  // an array for "size", a plain string for everything else.
  const handleAttributeKeyChange = (index, key) => {
    setNewVariant((prev) => {
      const updated = [...prev.attributes];
      updated[index] = { key, value: key === "size" ? [] : "" };
      return { ...prev, attributes: updated };
    });
  };

  const toggleSizeValue = (index, size) => {
    setNewVariant((prev) => {
      const updated = [...prev.attributes];
      const current = Array.isArray(updated[index].value)
        ? updated[index].value
        : [];
      const next = current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size];
      updated[index] = { ...updated[index], value: next };
      return { ...prev, attributes: updated };
    });
  };

  const removeAttributes = (rmvAtr) => {
    setNewVariant((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, idx) => idx !== rmvAtr),
    }));
  };

  const handleChangeImage = (e) => {
    const files = Array.from(e.target.files);
    const formattedFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewVariant((prev) => ({
      ...prev,
      productImages: [...prev.productImages, ...formattedFiles],
    }));
    e.target.value = "";
  };

  const removeImages = (indexToRemove) => {
    setNewVariant((prev) => {
      const removed = prev.productImages[indexToRemove];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return {
        ...prev,
        productImages: prev.productImages.filter(
          (_, index) => index !== indexToRemove,
        ),
      };
    });
  };

  const confirmDeleteVariant = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await handleDeleteVariant(productId, deleteTarget._id);
      setVariants((prev) => prev.filter((v) => v._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Size options depend on the Clothing/Shoes toggle, not the product category.
  const PANT_CATEGORIES = [
    "jeans",
    "trouser",
    "trousers",
    "chino",
    "chinos",
    "jogger",
    "joggers",
    "pants",
  ];

  const isPantCategory = PANT_CATEGORIES.includes(
    product?.category?.name?.toLowerCase() ||
      product?.category?.slug?.toLowerCase(),
  );

  const SIZE_OPTIONS = isPantCategory
    ? PANT_SIZES
    : sizeType === "shoes"
      ? SHOE_SIZES
      : CLOTHING_SIZES;
  const submitVariantHandler = async () => {
    const attrs = {};
    newVariant.attributes.forEach((a) => {
      const hasValue = Array.isArray(a.value)
        ? a.value.length > 0
        : Boolean(a.value);
      if (a.key && hasValue) attrs[a.key] = a.value;
    });

    const payload = { ...newVariant, attributes: attrs };

    setSubmitting(true);
    try {
      const createdVariant = await handleAddProductVariants(productId, payload);
      if (createdVariant) {
        setVariants((prev) => [...prev, createdVariant]);
        setNewVariant({
          stock: "",
          price: { amount: "" },
          attributes: [{ key: "", value: "" }],
          productImages: [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (product) {
      document.title = product.title + " | Outfique";
    }
  });

  return (
    <div className="min-h-screen w-full bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 lg:py-16">
        {loading ? (
          <SellerProductDetailSkeleton />
        ) : !product ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              We couldn't find this product.
            </p>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="-ml-2 mb-6 gap-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {/* Product info */}
            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease }}
              className="grid md:grid-cols-2 gap-10 mb-14"
            >
              <div className="grid grid-cols-2 gap-3">
                {product.productImages?.map((img, index) => (
                  <div
                    key={img._id || index}
                    className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900"
                  >
                    <img
                      src={img.url || img.preview}
                      alt={product.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/600x800?text=No+Image";
                      }}
                      className="w-full h-[240px] object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-center gap-4">
                <div>
                  <span className="text-xs font-medium tracking-[0.15em] uppercase text-stone-500 dark:text-stone-400">
                    Product Details
                  </span>
                  <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                    {product.title}
                  </h1>
                  <div className="mt-4 h-px w-10 bg-stone-300 dark:bg-stone-700" />
                </div>

                <p className="text-2xl font-semibold">
                  {formatPrice(product.price?.amount, product.price?.currency)}
                </p>

                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {product.description}
                </p>
              </div>
            </motion.div>

            {/* Add variant */}
            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease, delay: 0.1 }}
              className="mb-14"
            >
              <Card className="rounded-2xl border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-6">
                    Add Product Variant
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-medium tracking-[0.1em] uppercase text-stone-500 dark:text-stone-400">
                        Stock
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter stock"
                        value={newVariant.stock}
                        onChange={(e) =>
                          setNewVariant((prev) => ({
                            ...prev,
                            stock: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-medium tracking-[0.1em] uppercase text-stone-500 dark:text-stone-400">
                        Variant Price
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter variant price"
                        value={newVariant.price.amount}
                        onChange={(e) =>
                          setNewVariant((prev) => ({
                            ...prev,
                            price: { ...prev.price, amount: e.target.value },
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="mb-8">
                    <Label className="text-xs font-medium tracking-[0.1em] uppercase text-stone-500 dark:text-stone-400">
                      Attributes
                    </Label>
                    <div className="mt-3 space-y-3">
                      {newVariant.attributes.map((attr, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Select
                            value={attr.key}
                            onValueChange={(value) =>
                              handleAttributeKeyChange(idx, value)
                            }
                          >
                            <SelectTrigger
                              className={`w-40 shrink-0 ${inputClass}`}
                            >
                              <SelectValue placeholder="Attribute" />
                            </SelectTrigger>
                            <SelectContent>
                              {ATTRIBUTE_KEYS.map((key) => (
                                <SelectItem key={key} value={key}>
                                  {key}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {attr.key === "size" ? (
                            <div className="flex-1 flex flex-col gap-2 pt-1">
                              {/* Clothing / Shoes toggle — only shown for the "size" attribute */}
                              <div className="flex rounded-full border border-stone-200 dark:border-stone-800 p-0.5 w-fit">
                                <button
                                  type="button"
                                  onClick={() => setSizeType("clothing")}
                                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                                    sizeType === "clothing"
                                      ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                                      : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                                  }`}
                                >
                                  Clothing
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSizeType("shoe")}
                                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                                    sizeType === "shoe"
                                      ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                                      : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                                  }`}
                                >
                                  Shoes
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {SIZE_OPTIONS.map((size) => {
                                  const selected =
                                    Array.isArray(attr.value) &&
                                    attr.value.includes(size);
                                  return (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => toggleSizeValue(idx, size)}
                                      aria-pressed={selected}
                                      className={`px-3 h-9 rounded-lg text-xs font-medium border transition-colors duration-200 ${
                                        selected
                                          ? "bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900 dark:border-white"
                                          : "border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600"
                                      }`}
                                    >
                                      {size}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <Input
                              placeholder="Value"
                              value={attr.value}
                              onChange={(e) =>
                                handleAttributesChange(
                                  idx,
                                  "value",
                                  e.target.value,
                                )
                              }
                              className={`flex-1 ${inputClass}`}
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => removeAttributes(idx)}
                            aria-label="Remove attribute"
                            className="shrink-0 w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAttributes}
                      className="mt-3 rounded-full gap-1.5 border-stone-300 dark:border-stone-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Attribute
                    </Button>
                  </div>

                  {/* Images */}
                  <div className="mb-8">
                    <Label className="text-xs font-medium tracking-[0.1em] uppercase text-stone-500 dark:text-stone-400">
                      Variant Images
                    </Label>

                    <label
                      htmlFor="variantImages"
                      className="mt-3 relative flex items-center justify-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-500 bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors duration-300 cursor-pointer min-h-[140px] group"
                    >
                      <input
                        id="variantImages"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleChangeImage}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-300 pointer-events-none">
                        <ImagePlus className="w-6 h-6 text-stone-400" />
                        <div className="text-center">
                          <p className="text-sm">Drop images here</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            or click to browse
                          </p>
                        </div>
                      </div>
                    </label>

                    {newVariant.productImages.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                        {newVariant.productImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative group aspect-square rounded-xl overflow-hidden ring-1 ring-stone-200 dark:ring-stone-800"
                          >
                            <img
                              src={img.preview}
                              alt={`variant preview ${idx}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImages(idx)}
                              aria-label="Remove image"
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={submitVariantHandler}
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 text-sm font-medium tracking-wide disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Variant"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Variant cards */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-6">
                Product Variants
              </h2>

              {variants.length === 0 ? (
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  No variants added yet.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <AnimatePresence>
                    {variants.map((variant, index) => (
                      <motion.div
                        key={variant._id || index}
                        layout
                        initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                          reduceMotion
                            ? { opacity: 0 }
                            : {
                                opacity: 0,
                                scale: 0.95,
                                transition: { duration: 0.25, ease },
                              }
                        }
                        transition={{
                          duration: 0.35,
                          ease,
                          delay: index * 0.05,
                        }}
                        className="relative group rounded-2xl overflow-hidden ring-1 ring-stone-200 dark:ring-stone-800 bg-white dark:bg-stone-900"
                      >
                        {deleting && deleteTarget?._id === variant._id && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-black/60 backdrop-blur-[1px]">
                            <Loader2 className="w-5 h-5 animate-spin text-stone-900 dark:text-white" />
                          </div>
                        )}

                        <button
                          type="button"
                          aria-label="Delete variant"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(variant);
                          }}
                          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:text-rose-400 transition-all duration-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-stone-800 rounded-t-2xl">
                          <img
                            src={
                              variant.productImages?.[0]?.url ||
                              variant.productImages?.[0]?.preview
                            }
                            alt=""
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-lg font-semibold">
                              {formatPrice(
                                getVariantAmount(variant),
                                product.price?.currency,
                              )}
                            </p>
                            <Badge
                              variant="secondary"
                              className="rounded-full text-xs shrink-0 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                            >
                              Stock {variant.stock}
                            </Badge>
                          </div>

                          {variant.attributes && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {Object.entries(variant.attributes).map(
                                ([key, value]) => (
                                  <Badge
                                    key={key}
                                    variant="outline"
                                    className="rounded-full text-[0.65rem] font-medium tracking-wide uppercase border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                                  >
                                    {key}:{" "}
                                    {Array.isArray(value)
                                      ? value.join(", ")
                                      : String(value).trim()}
                                  </Badge>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
              aria-labelledby="delete-variant-title"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease }}
              className="fixed z-[71] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                  {deleteTarget.productImages?.[0]?.url ||
                  deleteTarget.productImages?.[0]?.preview ? (
                    <img
                      src={
                        deleteTarget.productImages[0].url ||
                        deleteTarget.productImages[0].preview
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImagePlus className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    id="delete-variant-title"
                    className="text-sm font-semibold text-stone-900 dark:text-white truncate"
                  >
                    {formatPrice(
                      getVariantAmount(deleteTarget),
                      product?.price?.currency,
                    )}{" "}
                    variant
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    This action can't be undone
                  </p>
                </div>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
                Are you sure you want to delete this variant
                {deleteTarget.attributes &&
                  Object.keys(deleteTarget.attributes).length > 0 && (
                    <>
                      {" "}
                      (
                      {Object.entries(deleteTarget.attributes)
                        .map(
                          ([key, value]) =>
                            `${key}: ${Array.isArray(value) ? value.join(", ") : value}`,
                        )
                        .join(" · ")}
                      )
                    </>
                  )}
                ? It will be removed from this product's listing immediately.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 h-11 rounded-xl border border-stone-200 dark:border-stone-800 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteVariant}
                  disabled={deleting}
                  className="flex-1 h-11 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Variant"
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

function SellerProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <Skeleton className="h-8 w-16 mb-6 rounded-full" />
      <div className="grid md:grid-cols-2 gap-10 mb-14">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[240px] w-full rounded-xl" />
          ))}
        </div>
        <div className="flex flex-col justify-center gap-4">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-8 w-3/4 rounded" />
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-20 w-full rounded" />
        </div>
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

export default SellerProductDetail;
