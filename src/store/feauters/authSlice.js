import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/* -------------------- Thunks -------------------- */

// Register
export const register = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      if (!res.ok) return rejectWithValue("Failed to register");
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      if (!res.ok) return rejectWithValue("Invalid credentials");
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch profile by ID
export const fetchUserById = createAsyncThunk(
  "auth/fetchUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:8000/api/users/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      return data.user;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Toggle follow
export const toggleFollow = createAsyncThunk(
  "auth/toggleFollow",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/users/follow/${userId}`,
        { method: "PUT", credentials: "include" }
      );
      if (!res.ok) throw new Error("Follow failed");
      return await res.json(); // { following, followersCount }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch followers
export const fetchFollowers = createAsyncThunk(
  "auth/fetchFollowers",
  async (userId) => {
    const res = await fetch(
      `http://localhost:8000/api/users/${userId}/followers`,
      { credentials: "include" }
    );
    return res.json();
  }
);

// Fetch following
export const fetchFollowing = createAsyncThunk(
  "auth/fetchFollowing",
  async (userId) => {
    const res = await fetch(
      `http://localhost:8000/api/users/${userId}/following`,
      { credentials: "include" }
    );
    return res.json();
  }
);

/* -------------------- Initial State -------------------- */

let savedUser = null;
try {
  const stored = localStorage.getItem("user");
  if (stored) savedUser = JSON.parse(stored);
} catch {
  savedUser = null;
}

const initialState = {
  user: savedUser,
  profileUser: null,
  loading: "idle",
  profileUserLoading: "idle",
  followersList: [],
  followingList: [],
  error: null,
};

/* -------------------- Slice -------------------- */

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.profileUser = null;
      state.followersList = [];
      state.followingList = [];
      state.loading = "idle";
      state.profileUserLoading = "idle";
      state.error = null;
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => { state.loading = "loading"; })
      .addCase(register.fulfilled, (state) => { state.loading = "success"; })
      .addCase(register.rejected, (state, action) => {
        state.loading = "failed"; state.error = action.payload;
      })

      // Login
      .addCase(login.pending, (state) => { state.loading = "loading"; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = "success";
        state.user = {
          ...action.payload.user,
          followers: action.payload.user.followers || [],
          following: action.payload.user.following || [],
        };
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = "failed"; state.error = action.payload;
      })

      // Fetch profile user
      .addCase(fetchUserById.pending, (state) => { state.profileUserLoading = "loading"; })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.profileUserLoading = "success";
        state.profileUser = {
          ...action.payload,
          followers: action.payload.followers || [],
          following: action.payload.following || [],
        };
      })
      .addCase(fetchUserById.rejected, (state) => { state.profileUserLoading = "failed"; })

      // Toggle follow
      .addCase(toggleFollow.fulfilled, (state, action) => {
        const { following } = action.payload;
        const profileUser = state.profileUser;
        const loggedInUser = state.user;
        if (!profileUser || !loggedInUser) return;

        const profileId = profileUser._id;
        const loggedInId = loggedInUser._id;

        profileUser.followers ||= [];
        loggedInUser.following ||= [];

        if (following) {
          if (!profileUser.followers.includes(loggedInId)) profileUser.followers.push(loggedInId);
          if (!loggedInUser.following.includes(profileId)) loggedInUser.following.push(profileId);
        } else {
          profileUser.followers = profileUser.followers.filter((id) => id !== loggedInId);
          loggedInUser.following = loggedInUser.following.filter((id) => id !== profileId);
        }
        localStorage.setItem("user", JSON.stringify(loggedInUser));
      })

      // Fetch followers list
      .addCase(fetchFollowers.fulfilled, (state, action) => { state.followersList = action.payload; })
      // Fetch following list
      .addCase(fetchFollowing.fulfilled, (state, action) => { state.followingList = action.payload; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
