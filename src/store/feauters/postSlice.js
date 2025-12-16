import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// CREATE POST
export const createPost = createAsyncThunk(
  "posts/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8000/api/posts/create", {
        method: "POST",
        body: formData, // FormData includes image + caption
        credentials: "include",
      });

      if (!res.ok) {
        return rejectWithValue("Failed to create post");
      }

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// FETCH POSTS
export const fetchPosts = createAsyncThunk(
  "posts/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8000/api/posts/getposts", {
        credentials: "include",
      });

      if (!res.ok) {
        return rejectWithValue("Failed to fetch posts");
      }

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// UPDATE POST
export const updatePost = createAsyncThunk(
  "posts/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:8000/api/posts/${id}`, {
        method: "PUT",
        body: formData, // FormData includes updated caption + optional image
        credentials: "include",
      });

      if (!res.ok) {
        return rejectWithValue("Failed to update post");
      }

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// INITIAL STATE
const postSlice = createSlice({
  name: "posts",
  initialState: { posts: [], loading: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // CREATE POST
      .addCase(createPost.pending, (state) => {
        state.loading = "loading";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = "success";
        state.posts.unshift(action.payload.newPost);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })
      // FETCH POSTS
      .addCase(fetchPosts.pending, (state) => {
        state.loading = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = "success";
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })
      // UPDATE POST
      .addCase(updatePost.pending, (state) => {
        state.loading = "loading";
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = "success";
        // Replace the updated post in posts array
        state.posts = state.posts.map((post) =>
          post._id === action.payload.updatedPost._id ? action.payload.updatedPost : post
        );
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      });
  },
});

export default postSlice.reducer;
