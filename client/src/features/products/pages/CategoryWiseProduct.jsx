import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Product from "../components/Product";
import { useProduct } from "../hooks/useProduct";

const CategoryWiseProduct = () => {
  const { handleGetProductBySlug } = useProduct();
  const [productData, setProductData] = useState([]);
  const { slug } = useParams();

  const fetchProductData = async () => {
    const res = await handleGetProductBySlug(slug);
    setProductData(res);
  };

  useEffect(() => {
    if (slug) {
      fetchProductData();
    }
  }, [slug]);

  if (productData.length === 0) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-gray-500 text-lg">
          No products found in this category.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="filteration">
        
      </div>
      <div className="allProducts">
        <div className="flex flex-col gap-5 px-4">
          <h1>{slug}</h1>
          <Product products={productData} />
        </div>
      </div>
    </div>
  );
};

export default CategoryWiseProduct;
