import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {authFetch} from "../hooks/authFetch"
/* ASYNC THUNKS */
export const createStatus = createAsyncThunk(
  "status/createStatus",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await authFetch("http://localhost:8000/api/status/create", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data; // populated status
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchStatusesByUserId = createAsyncThunk(
  "status/fetchStatusesByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await authFetch(`http://localhost:8000/api/status/user/${userId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAllStatuses = createAsyncThunk(
  "status/fetchAllStatuses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authFetch("http://localhost:8000/api/status", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteStatus = createAsyncThunk(
  "status/deleteStatus",
  async (statusId, { rejectWithValue }) => {
    try {
      const res = await authFetch(`http://localhost:8000/api/status/${statusId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return statusId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* SLICE */
const statusSlice = createSlice({
  name: "status",
  initialState: { statuses: [], loading: "idle", creating: false, error: null },
  reducers: { clearStatuses: (state) => (state.statuses = []) },
  extraReducers: (builder) => {
    builder
      .addCase(createStatus.fulfilled, (state, action) => {
        state.creating = false;
        state.statuses = [action.payload, ...state.statuses.filter(s => s.user._id !== action.payload.user._id)];
      })
      .addCase(fetchStatusesByUserId.fulfilled, (state, action) => {
        action.payload.forEach(s => {
          if (!state.statuses.find(st => st._id === s._id)) state.statuses.push(s);
        });
      })
      .addCase(fetchAllStatuses.fulfilled, (state, action) => {
        action.payload.forEach(s => {
          if (!state.statuses.find(st => st._id === s._id)) state.statuses.push(s);
        });
      })
      .addCase(deleteStatus.fulfilled, (state, action) => {
        state.statuses = state.statuses.filter(s => s._id !== action.payload);
      });
  },
});

export const { clearStatuses } = statusSlice.actions;
export default statusSlice.reducer;
