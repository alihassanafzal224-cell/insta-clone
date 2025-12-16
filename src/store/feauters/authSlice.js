import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';


export const register = createAsyncThunk("auth/register", async (formData, { rejectWithValue }) => {
  try {
    const res = await fetch("http://localhost:8000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      credentials: "include"  
    });

    if (!res.ok) {
      return rejectWithValue("Failed to register");
    }

    const data = await res.json();
    return data;

  } catch (error) {
    return rejectWithValue(error.message);
  }
}
);

export const login = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include"  

      })
      if (!res.ok) {
        return rejectWithValue("Invalid credentials");
      }
      const data = await res.json();
       return data;
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)


const initialState = {
  user: null || localStorage.getItem("user"),
  loading: "idle",
  error: null,
};


export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout:(state)=>{
   
      state.user = null
      state.loading = "idle"
      state.error = null
      localStorage.removeItem("user")
      
    },
    },

  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = "success";
        state.user = null;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })
      .addCase(login.pending,(state)=>{
        state.loading = "loading"
        state.error = null
      })
      .addCase(login.fulfilled,(state,action)=>{
        state.loading = "success"
        state.user = action.payload.user;
        localStorage.setItem("user", action.payload.user)
        state.error = null
      })
      .addCase(login.rejected,(state,action)=>{
        state.loading = "failed"
        state.error = action.payload
      })
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
