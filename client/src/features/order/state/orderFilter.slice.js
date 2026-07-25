import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    search: "",
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    sort: "-createdAt",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
};

const orderFilterSlice = createSlice({
  name: "orderFilter",
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setPaymentStatus(state, action) {
      state.paymentStatus = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setDateRange: (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    clearFilters(state) {
      state.search = "";
      state.status = "";
      state.paymentStatus = "";
      state.paymentMethod = "";
      state.sort = "-createdAt";
      state.startDate = "";
      state.endDate = "";
      state.page = 1;
      state.limit = 10;
    },
  },
});

export const { setSearch, setStatus, setPaymentMethod, setPaymentStatus, setSort, setDateRange, setPage, setLimit, clearFilters } = orderFilterSlice.actions

export default orderFilterSlice.reducer