import {useDispatch} from "react-redux"
import { addItems, deleteItems, setItems } from "../state/wishlist.state"
import { addWishlist, deleteWishList, getWishlist } from "../service/wishlist.api"

export const useWishlist = () => {
    const dispatch = useDispatch()

    const handleAddWishlist = async(productId, variantId) => {
        try {
            const item = await addWishlist(productId, variantId)
            dispatch(addItems(item))
        } catch (error) {
            throw error.message
        }
    }

    const handleGetWishlist = async () => {
        try {
            const items = await getWishlist()
            dispatch(setItems(items.wishlist.items));
            return items.wishlist.items
        } catch (error) {
            throw error.message
        }
    }

    const handleDeleteWishlist = async (productId, variantId) => {
        try {
            const res = await deleteWishList(productId, variantId)            
            dispatch(deleteItems({ productId, variantId }))  
            return res
        } catch (error) {
            throw error.message
        }
    }
    return {handleAddWishlist, handleGetWishlist, handleDeleteWishlist}
}