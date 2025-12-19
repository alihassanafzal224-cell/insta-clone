import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// CREATE POST
export const createPost = createAsyncThunk(
  "posts/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8000/api/posts/create", {
        method: "POST",
        body: formData,
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

// FETCH ALL POSTS
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

// FETCH USER POSTS
export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8000/api/posts/my-posts", {
        credentials: "include",
      });

      if (!res.ok) {
        return rejectWithValue("Failed to fetch user posts");
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
      const res = await fetch(`http://localhost:8000/api/posts/update/${id}`, {
        method: "PUT",
        body: formData,
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
export const fetchPostsByUserId = createAsyncThunk(
  "posts/fetchByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/posts/user/${userId}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch user posts");
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


// INITIAL STATE
const postSlice = createSlice({
  name: "posts",
  initialState: { posts: [], loading: "idle", error: null, userPosts: [], userPostsLoading: "idle", userPostsError: null },
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
      // FETCH ALL POSTS
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
      // FETCH USER POSTS
      .addCase(fetchUserPosts.pending, (state) => {
        state.userPostsLoading = "loading";
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.userPostsLoading = "success";
        state.userPosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.userPostsLoading = "failed";
        state.userPostsError = action.payload;
      })
      // UPDATE POST
      .addCase(updatePost.pending, (state) => {
        state.loading = "loading";
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = "success";
        state.posts = state.posts.map((post) =>
          post._id === action.payload.updatedPost._id ? action.payload.updatedPost : post
        );
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      })
      .addCase(fetchPostsByUserId.pending, (state) => {
        state.userPostsLoading = "loading";
      })
      .addCase(fetchPostsByUserId.fulfilled, (state, action) => {
        state.userPostsLoading = "success";
        state.userPosts = action.payload;
      })
      .addCase(fetchPostsByUserId.rejected, (state, action) => {
        state.userPostsLoading = "failed";
        state.userPostsError = action.payload;
      });
  },
});

export default postSlice.reducer;