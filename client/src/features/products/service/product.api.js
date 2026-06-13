import axios from "axios";

const productApiInstance = axios.create({
  baseURL: "/api/products",
  withCredentials: true
});

const categoryApiInstance = axios.create({
  baseURL: "/api/category",
  withCredentials: true
})

export const createProducts = async (formData) => {
  try {
    const response = await productApiInstance.post("/", formData);
    return response.data;
  } catch (error) {
    throw error.message;
  }
};

export const getSellerAllProducts = async () => {
  try {
    const response = await productApiInstance.get("/seller");
    return response.data;
  } catch (error) {
    throw error.message;
  }
};

export const getAllProducts = async () => {
  const response = await productApiInstance.get("/");
  return response.data;
};

export const getProductById = async (productId) => {
  try {
    const response = await productApiInstance.get(`/details/${productId}`);
    return response.data;
  } catch (error) {
    throw error.message;
  }
};

export const searchProducts = async (search) => {
  try {
    const response = await productApiInstance.get(`/product/search`, {
     params: {search, page: 1, limit: 10}
   });
return response.data
  } catch (error) {
    throw error.message
  }
}

export const addProductVariant = async (productId, newProductVariant) => {
  const formData = new FormData()

  newProductVariant.productImages.forEach((img) => {
    formData.append("productImages", img.file)
  })

  formData.append("stock", newProductVariant.stock)
  formData.append('amount', newProductVariant.price.amount)
  formData.append("attributes", JSON.stringify(newProductVariant.attributes))

  const response = await productApiInstance.post(`/${productId}/variants`, formData)

  return response.data
}

export const createCategory = async (formData) => {
  const response = await categoryApiInstance.post("/", formData)
  return response.data
}

export const getAllCategory = async () => {
  const response = await categoryApiInstance.get("/")
  return response.data
}