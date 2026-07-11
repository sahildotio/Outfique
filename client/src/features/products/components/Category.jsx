import { useEffect, useRef, useState } from "react";
import { useProduct } from "../hooks/useProduct";
import { Link, useNavigate } from "react-router";

const Category = () => {
  const { handleGetAllCategory } = useProduct();

  const [categoryData, setCategoryData] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const itemRefs = useRef({});

  const fetchCategoryData = async () => {
    try {
      const res = await handleGetAllCategory();
      setCategoryData(res);
      if (res?.length) setActiveId(res[0]._id);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const navigate = useNavigate()

  useEffect(() => {
    fetchCategoryData();
  }, []);

  if (!categoryData.length) return null;

  return (
    <div className="px-4 py-3 flex  justify-center">
      <div className="overflow-x-auto scrollbar-hide">
        {categoryData.map((cat) => {
          const isActive = activeId === cat._id;

          return (
            <Link
              key={cat._id}
              ref={(el) => (itemRefs.current[cat._id] = el)}

              onClick={(e) => {
                e.preventDefault();
                setActiveId(cat._id);
                navigate(`/${cat.slug}`)
              }}
              className={`relative z-10 px-6 py-3 text-sm sm:text-base font-medium whitespace-nowrap rounded-full transition-colors duration-200 ${
                isActive
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Category;
