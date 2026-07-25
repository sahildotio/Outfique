import axios from "axios"

const sellerOrderApiInstance = axios.create({
  baseURL: "/api/buyer/order",
  withCredentials: true,
});

export const getSellerOrder = async () => {
    try{
        const response = await sellerOrderApiInstance.get("/")
        return response.data
    } catch (error) {
        console.log(error.message)
    }
}

export const getDetailSellerOrder = async (orderid) => {
    try {
        const response = await sellerOrderApiInstance.get(`/${orderid}`)   
        return response.data
    } catch (error) {
        console.log(error.message)
    }
}

export const updateOrderSeller = async (orderid) => {
    try {
        const response = await sellerOrderApiInstance.patch(`/${orderid}/status`)
        return response.data
    } catch (error) {
        console.log(error.message)
    }
}

export const trackingBuyerOrder = async (orderid) => {
    try {
        const response = await sellerOrderApiInstance.patch(`/${orderid}/tracking`)
        return response.data
    } catch (error) {
        console.log(error.message)
    }
}

export const reviewSellerOrder = async (orderid) => {
    try {
        const response = await sellerOrderApiInstance.patch(`/${orderid}/review`)
        return response.data
    } catch (error) {
        console.log(error.message)
    }
}