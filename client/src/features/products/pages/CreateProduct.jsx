import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ImagePlus, X, Loader2, ChevronDown, Plus } from "lucide-react";
import { useProduct } from "../hooks/useProduct";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const ease = [0.22, 1, 0.36, 1];

const CreateProduct = () => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { handleCreateProducts, handleCreateCategory, handleGetAllCategory } =
    useProduct();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "",
    category: "",
  });
  const [images, setImages] = useState([]);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryMode, setCategoryMode] = useState("select"); // "select" | "create"
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null); // { file, url }

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await handleGetAllCategory();
        setCategories(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 7) {
      alert("You can only select up to 7 images in total.");
      e.target.value = "";
      return;
    }
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[indexToRemove].url);
      newImages.splice(indexToRemove, 1);
      return newImages;
    });
  };

  const handleNewCategoryImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (newCategoryImage) URL.revokeObjectURL(newCategoryImage.url);
    setNewCategoryImage({ file, url: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const removeNewCategoryImage = () => {
    if (newCategoryImage) URL.revokeObjectURL(newCategoryImage.url);
    setNewCategoryImage(null);
  };

  const switchCategoryMode = (mode) => {
    setCategoryMode(mode);
    setErrorMsg("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (categoryMode === "select" && !formData.category) {
      setErrorMsg("Select a category, or create a new one.");
      return;
    }
    if (categoryMode === "create" && !newCategoryName.trim()) {
      setErrorMsg("Enter a name for the new category.");
      return;
    }
    if (images.length === 0) {
      setErrorMsg("Add at least one product image.");
      return;
    }

    setSubmitting(true);
    try {
      let categoryId = formData.category;

      if (categoryMode === "create") {
        const categoryFd = new FormData();
        categoryFd.append("name", newCategoryName.trim());
        if (newCategoryImage) categoryFd.append("image", newCategoryImage.file);
        const newCategory = await handleCreateCategory(categoryFd);
        categoryId = newCategory._id;
      }

      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("amount", formData.amount);
      fd.append("currency", formData.currency);
      fd.append("category", categoryId);
      images.forEach((img) => {
        fd.append("productImages", img.file);
      });

      const data = await handleCreateProducts(fd);
      console.log(data);

      navigate("/seller/dashboard");
      setFormData({
        title: "",
        description: "",
        amount: "",
        currency: "",
        category: "",
      });
      setImages([]);
      setNewCategoryName("");
      setNewCategoryImage(null);
    } catch (error) {
      console.error(error);
      setErrorMsg(
        "Something went wrong while creating the product. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="mb-10"
        >
          <span className="text-xs font-medium tracking-[0.15em] text-stone-500 dark:text-stone-400 uppercase">
            Seller Dashboard
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
            Create Product
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Add a new item to your inventory
          </p>
          <div className="mt-6 h-px bg-stone-200 dark:bg-stone-800" />
        </motion.div>

        <motion.form
          initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          onSubmit={submitHandler}
          className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8"
        >
          {/* ── Left column ── */}
          <div className="space-y-7">
            <Field label="Product Title">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onChangeHandler}
                placeholder="e.g. Minimalist Watch"
                required
                className={inputClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={onChangeHandler}
                placeholder="Detailed description of the product..."
                required
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount">
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={onChangeHandler}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Currency">
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    onChangeHandler({
                      target: {
                        name: "currency",
                        value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-full h-11 rounded-xl">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="INR">🇮🇳 INR (₹)</SelectItem>
                    <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                    <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                    <SelectItem value="GBP">🇬🇧 GBP (£)</SelectItem>
                    <SelectItem value="JPY">🇯🇵 JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-[0.1em] uppercase text-stone-500 dark:text-stone-400">
                  Category
                </span>
                <div className="flex rounded-full border border-stone-200 dark:border-stone-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => switchCategoryMode("select")}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                      categoryMode === "select"
                        ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                        : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                    }`}
                  >
                    Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => switchCategoryMode("create")}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                      categoryMode === "create"
                        ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                        : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                    }`}
                  >
                    New
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {categoryMode === "select" ? (
                  <motion.div
                    key="select"
                    initial={reduceMotion ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduceMotion ? {} : { opacity: 0 }}
                    transition={{ duration: 0.2, ease }}
                    className="relative"
                  >
                    <Field label="Category">
                      <Select
                        value={formData.category || ""}
                        disabled={categoriesLoading}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full rounded-xl">
                          <SelectValue
                            placeholder={
                              categoriesLoading
                                ? "Loading categories..."
                                : "Select category"
                            }
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                 
                  </motion.div>
                ) : (
                  <motion.div
                    key="create"
                    initial={reduceMotion ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduceMotion ? {} : { opacity: 0 }}
                    transition={{ duration: 0.2, ease }}
                    className="flex gap-3"
                  >
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category name"
                      className={`${inputClass} flex-1`}
                    />
                    <label
                      htmlFor="newCategoryImage"
                      className="relative shrink-0 w-11 h-11 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-500 flex items-center justify-center cursor-pointer transition-colors overflow-hidden"
                    >
                      {newCategoryImage ? (
                        <>
                          <img
                            src={newCategoryImage.url}
                            alt="New category"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeNewCategoryImage();
                            }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </>
                      ) : (
                        <ImagePlus className="w-4 h-4 text-stone-400" />
                      )}
                      <input
                        id="newCategoryImage"
                        type="file"
                        accept="image/*"
                        onChange={handleNewCategoryImage}
                        className="hidden"
                      />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col justify-between gap-8">
            {/* Image upload */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium tracking-[0.1em] uppercase text-stone-500 dark:text-stone-400">
                Product Images ({images.length}/7)
              </span>

              <label
                htmlFor="images"
                className="relative flex items-center justify-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-500 bg-stone-50 dark:bg-stone-900/50 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors duration-300 cursor-pointer min-h-[160px] group"
              >
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
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

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square overflow-hidden rounded-xl ring-1 ring-stone-200 dark:ring-stone-800"
                    >
                      <img
                        src={img.url}
                        alt={`preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <AnimatePresence>
                {errorMsg && (
                  <motion.p
                    initial={reduceMotion ? {} : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduceMotion ? {} : { opacity: 0, height: 0 }}
                    className="mb-3 text-xs text-rose-600 dark:text-rose-400"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={reduceMotion ? {} : { scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full h-13 py-3.5 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-stone-900 text-sm font-medium tracking-wide hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-900 dark:focus-visible:ring-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Product
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

const inputClass =
  "w-full px-3 py-2.5 rounded-xl bg-transparent border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors duration-300";

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-[0.1em] uppercase text-stone-500 dark:text-stone-400">
        {label}
      </span>
      {children}
    </div>
  );
}

export default CreateProduct;
