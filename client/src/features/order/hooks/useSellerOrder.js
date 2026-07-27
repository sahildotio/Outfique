import {
    getDetailSellerOrder,
    getSellerDashboard,
    getSellerOrder,
    reviewSellerOrder,
    trackingBuyerOrder,
    updateOrderSeller
} from "../service/sellerOrder.service.js"

export const useSellerOrder = () => {

    const handleSellerAnalytics = async () => {
        try {
            const res = await getSellerDashboard()
            console.log(res.data)
            return res.data
        } catch (error) {
            console.error(error.message)
        }
    }

    const handleGetSellerOrder = async () => {
        try {
            const res = await getSellerOrder()
            return res.orders
        } catch (error) {
            console.log(error.message)
        }
    }
    
    const handelGetSellerOrderDetail = async (orderid) => {
        try {
            const res = await getDetailSellerOrder(orderid)
            return res.order
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleUpdateSellerOrder = async (orderid, status) => {
         try {
            const res = await updateOrderSeller(orderid, status)
            return res.order
        } catch (error) {
            console.log(error.message)
        }
    } 

    const handleTrackingBuyerOrder = async (orderid) => {
        try {
            const res = await trackingBuyerOrder(orderid)
            return res.order
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleReviewOrder = async (orderid) => {
        try {
            const res = await reviewSellerOrder(orderid)
            return res.data
        } catch (error) {
            console.log(error.message)
        }
    }
    
    return {handleSellerAnalytics, handleGetSellerOrder, handelGetSellerOrderDetail, handleUpdateSellerOrder, handleTrackingBuyerOrder, handleReviewOrder}
}