import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import examReducer from './examSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    exam: examReducer,
  },
});
