import { configureStore } from '@reduxjs/toolkit';
import cartSliceReducer from './slices/cartSlice';
import authSliceReducer from './slices/authSlice'; // 1. Import Auth

const store = configureStore({
  reducer: {
    cart: cartSliceReducer,
    auth: authSliceReducer, // 2. Add Auth to the store
  },
});

export default store;