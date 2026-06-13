import React, { useEffect, useState } from 'react'
import { useProduct } from '../hooks/useProduct';
import Category from '../components/Category';

const Home = () => {

  const { handleGetAllProducts } = useProduct();

  const [productData, setProductData] = useState(null)

  const fetchProductData = async () => {
    const res = await handleGetAllProducts()
    setProductData(res)
  }

  useEffect(() => {
      fetchProductData()
  }, [])
  
  return (
    <div>
      <Category />
    </div>
  )
}

export default Home