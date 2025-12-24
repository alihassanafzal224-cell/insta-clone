import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/* ===================== ASYNC THUNKS ===================== */

/* Create Status */
export const createStatus = createAsyncThunk(
    "status/createStatus",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await fetch("http://localhost:8000/api/status/create", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            return data.newStatus;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/* Own + Followed Statuses */
export const fetchStatusesByUserId = createAsyncThunk(
    "status/fetchStatusesByUserId",
    async (userId, { rejectWithValue }) => {
        try {
            const res = await fetch(
                `http://localhost:8000/api/status/user/${userId}`,
                { credentials: "include" }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            return data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/* All Statuses (Suggestions) */
export const fetchAllStatuses = createAsyncThunk(
    "status/fetchAllStatuses",
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch("http://localhost:8000/api/status", {
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

/* Delete Status */
export const deleteStatus = createAsyncThunk(
    "status/deleteStatus",
    async (statusId, { rejectWithValue }) => {
        try {
            const res = await fetch(`http://localhost:8000/api/status/${statusId}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            return statusId; // return deleted statusId
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/* ===================== SLICE ===================== */

const statusSlice = createSlice({
    name: "status",
    initialState: {
        statuses: [],
        loading: "idle",
        creating: false,
        error: null,
    },
    reducers: {
        clearStatuses: (state) => {
            state.statuses = [];
        },
    },
    extraReducers: (builder) => {
        builder
            /* ---------- CREATE STATUS ---------- */
            .addCase(createStatus.pending, (state) => {
                state.creating = true;
            })
            .addCase(createStatus.fulfilled, (state, action) => {
                state.creating = false;

                // Remove old status of same user
                state.statuses = state.statuses.filter(
                    (s) => s.user._id !== action.payload.user._id
                );

                // Add new status on top
                state.statuses.unshift(action.payload);

                // ✅ Optional: ensure loading is not blocking re-render
                state.loading = "succeeded";
            })
            .addCase(createStatus.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            /* ---------- OWN + FOLLOWED ---------- */
            .addCase(fetchStatusesByUserId.pending, (state) => {
                state.loading = "loading";
            })
            .addCase(fetchStatusesByUserId.fulfilled, (state, action) => {
                state.loading = "succeeded";
                action.payload.forEach((status) => {
                    if (!state.statuses.find((s) => s._id === status._id)) {
                        state.statuses.push(status);
                    }
                });
            })
            .addCase(fetchStatusesByUserId.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload;
            })

            /* ---------- ALL STATUSES (SUGGESTIONS) ---------- */
            .addCase(fetchAllStatuses.pending, (state) => {
                state.loading = "loading";
            })
            .addCase(fetchAllStatuses.fulfilled, (state, action) => {
                state.loading = "succeeded";
                action.payload.forEach((status) => {
                    if (!state.statuses.find((s) => s._id === status._id)) {
                        state.statuses.push(status);
                    }
                });
            })
            .addCase(fetchAllStatuses.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload;
            })

            /* ---------- DELETE STATUS ---------- */
            .addCase(deleteStatus.pending, (state) => {
                state.loading = "loading";
            })
            .addCase(deleteStatus.fulfilled, (state, action) => {
                state.loading = "succeeded";
                state.statuses = state.statuses.filter(
                    (status) => status._id !== action.payload
                );
            })
            .addCase(deleteStatus.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearStatuses } = statusSlice.actions;
export default statusSlice.reducer;
