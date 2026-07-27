import { getAllBuyerOrder, cancelBuyerOrder, getDetailBuyerOrder, requestBuyerOrder,reviewBuyerOrder } from "../service/buyerOrder.service"

export const useBuyerOrder = () => {
    const handleGetAllBuyerOrder = async() => {
        try {
            const res = await getAllBuyerOrder()
            return res.orders
        } catch (error) {
            console.log(error.message)
        }
    }
    
    const handleGetDetailBuyerOrder = async (orderid) => {
        try {
            const res = await getDetailBuyerOrder(orderid)
            return res.order
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleCancelOrder = async (orderid) => {
        try {
            const res = await cancelBuyerOrder(orderid)
            return res
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleRequestOrder = async (orderid) => {
        try {
            const res = await requestBuyerOrder(orderid)
            return res
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleReviewBuyerOrder = async (orderid) => {
        try {
            const res = await reviewBuyerOrder(orderid)
            return res
        } catch (error) {
            console.log(error.message)
        }
    }

    return {handleCancelOrder, handleRequestOrder, handleReviewBuyerOrder, handleGetAllBuyerOrder, handleGetDetailBuyerOrder}
}