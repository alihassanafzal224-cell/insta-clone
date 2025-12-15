import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./feauters/CounterSlice";
import authSlice from "./feauters/authSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    counter: counterReducer,
  },
});
