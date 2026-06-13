import { useEffect, useState } from "react";
import { useProduct } from "../hooks/useProduct";

const Category = () => {
  const { handleGetAllCategory } = useProduct();

  const [categoryData, setCategoryData] = useState([]);

  const fetchCategoryData = async () => {
    try {
      const res = await handleGetAllCategory();
      setCategoryData(res);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, []);

  return (
    <div className="flex gap-3 overflow-x-auto whitespace-nowrap px-4 py-3 scrollbar-hide ">
      {categoryData.map((category) => (
        <button
          key={category._id}
          className="flex-shrink-0 px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default Category;
