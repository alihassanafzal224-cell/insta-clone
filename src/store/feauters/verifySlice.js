import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// EMAIL 
export const verifyEmail = createAsyncThunk(
  "verify/email",
  async (token, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/users/verify/${token}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        return rejectWithValue("Email verification failed");
      }

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const verifySlice = createSlice({
  name: "verify",
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetVerifyState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { resetVerifyState } = verifySlice.actions;
export default verifySlice.reducer;
