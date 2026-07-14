import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalPrice: null,
    currency: null
  },
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
      state.totalPrice = action.payload.totalPrice?.amount ?? 0;
      state.currency = action.payload.totalPrice?.currency ?? "INR"
    },
    addItems: (state, action) => {
      state.items = action.payload.items
      state.totalPrice = action.totalPrice?.amount ?? 0;
      state.currency = action.totalPrice?.currency ?? "INR"
    },
    incrementItems: (state, action) => {
      const { productId, variantId } = action.payload;
      console.log(state.items);
      console.log(Array.isArray(state.items));
      const item = state.items.find(
        (item) => item.productId === productId && item.variantId === variantId,
      );

      if (item) {
        item.quantity += 1;
      }
    },
    decrementItems: (state, action) => {
      const { productId, variantId } = action.payload
      const item = state.items.find((item) => item.productId === productId && item.variantId === variantId)
      if(item) {
        item.quantity -= 1
      }
    },
    deleteItems: (state, action) => {
      const {productId, variantId} = action.payload

      state.items = state.items.filter((item) => !(item.productId === productId && item.variantId === variantId))
      
    }
  },
});

export const { setItems, addItems, incrementItems, decrementItems, deleteItems } =
  cartSlice.actions;
export default cartSlice.reducer;
