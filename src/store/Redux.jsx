import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./feauters/authSlice";
import postSlice from "./feauters/postSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    post: postSlice,
  },
});
