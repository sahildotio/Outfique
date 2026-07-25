import axios from "axios"

const buyerOrderApiInstance = axios.create({
    baseURL: "/api/buyer/order",
    withCredentials: true
});

export const getAllBuyerOrder = async () => {
    try {
        const response = await buyerOrderApiInstance.get("/")
        return response.data
    } catch (error) {
        console.log(error.message)
    }
}

export const getDetailBuyerOrder = async (orderid) => {
    try {
        const response = await buyerOrderApiInstance.get(`/${orderid}`)
        return response.data
    } catch (error) {
        console.log(error.message)
    }
}

export const cancelBuyerOrder = async(orderid) => {
    try {
        const response = await buyerOrderApiInstance.patch(`/${orderid}/cancel`)
        return response.data
    } catch (error) {
        console.log(error.message)
    }
}

export const requestBuyerOrder = async (orderid) => {
    try {
        const response = await buyerOrderApiInstance.patch(
          `/${orderid}/return`,
        );
        return response.data
    } catch (error) {
        console.log(error.message)
    }
}

export const reviewBuyerOrder = async (orderid) => {
    try {
        const response = await buyerOrderApiInstance.patch(`/${orderid}/review`)
        return response.data
    } catch (error) {
        console.log(error.message)
    }
}