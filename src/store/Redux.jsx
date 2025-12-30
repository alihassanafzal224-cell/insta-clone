import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./feauters/authSlice";
import postSlice from "./feauters/postSlice";
import statuses from "./feauters/statusSlice"
import verifySlice from "./feauters/verifySlice"
export const store = configureStore({
  reducer: {
    auth: authSlice,
    post: postSlice,
    verify:verifySlice,
    status : statuses,
  },
});
