import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useProduct } from "../hooks/useProduct";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ease = [0.22, 1, 0.36, 1];

const SellerCategory = ({ onCategoryChange }) => {
  const { handleGetAllCategory } = useProduct();

  const [categoryData, setCategoryData] = useState([]);
  const [activeId, setActiveId] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const res = await handleGetAllCategory();
        setCategoryData(res || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, []);

  // notify parent whenever the active category changes, including the
  // initial "all" state, so Dashboard can filter its product grid
  useEffect(() => {
    onCategoryChange?.(activeId);
  }, [activeId]);

  const options = [{ _id: "all", name: "All", image: null }, ...categoryData];

  return (
    <div className="relative w-full mb-8">
      {loading ? (
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* edge fade for scroll affordance on mobile */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white dark:from-[#0d0d0d] to-transparent z-10 sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white dark:from-[#0d0d0d] to-transparent z-10 sm:hidden" />

          <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {options.map((category) => {
              const isActive = category._id === activeId;

              return (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => setActiveId(category._id)}
                  className="relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e63b1f]/50"
                >
                  {isActive && (
                    <motion.span
                      layoutId="sellerCategoryActivePill"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-full bg-zinc-900 dark:bg-white"
                    />
                  )}

                  <Badge
                    variant="outline"
                    className={`relative z-10 h-9 px-4 rounded-full text-[11px] font-medium tracking-[0.08em] uppercase border-transparent transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? "text-white dark:text-zinc-900"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/[0.06]"
                    }`}
                  >
                    {category.image?.url && (
                      <img
                        src={category.image.url}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover mr-1.5 -ml-0.5"
                      />
                    )}
                    {category.name}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerCategory;
