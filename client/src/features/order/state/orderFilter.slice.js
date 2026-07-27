import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  search: "",

  status: [],
  paymentStatus: [],
  paymentMethod: [],

  sort: "-createdAt",

  startDate: null,
  endDate: null,

  page: 1,
  limit: 10,
};

const orderFilterSlice = createSlice({
  name: "orderFilter",
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.page = 1;
    },

    setStatus(state, action) {
      state.status = action.payload;
      state.page = 1;
    },

    setPaymentStatus(state, action) {
      state.paymentStatus = action.payload;
      state.page = 1;
    },

    setPaymentMethod(state, action) {
      state.paymentMethod = action.payload;
      state.page = 1;
    },

    setSort(state, action) {
      state.sort = action.payload;
    },

    setDateRange(state, action) {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.page = 1;
    },

    setPage(state, action) {
      state.page = action.payload;
    },

    setLimit(state, action) {
      state.limit = action.payload;
      state.page = 1;
    },

    clearFilters() {
      return initialState;
    },
  },
});

export const {
  setSearch,
  setStatus,
  setPaymentStatus,
  setPaymentMethod,
  setSort,
  setDateRange,
  setPage,
  setLimit,
  clearFilters,
} = orderFilterSlice.actions;

export default orderFilterSlice.reducer;