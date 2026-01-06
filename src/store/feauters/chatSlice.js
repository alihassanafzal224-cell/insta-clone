import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// -------------------- Thunks --------------------

// Load conversations
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8000/api/conversations", {
        credentials: "include"
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Load messages for selected conversation
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:8000/api/messages/${conversationId}`, {
        credentials: "include"
      });
      const data = await res.json();
      return { conversationId, messages: data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createConversation = createAsyncThunk(
  "chat/createConversation",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/conversations/${userId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


// -------------------- Slice --------------------
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    selectedConversation: null,
    messages: {},
    onlineUsers: [],
    loading: false,
    error: null
  },
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) state.messages[conversationId] = [];
      state.messages[conversationId].push(message);
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addTypingUser: (state, action) => {
      if (!state.typingUsers) state.typingUsers = [];
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action) => {
      state.typingUsers = state.typingUsers.filter(u => u !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// -------------------- Exports --------------------
export const {
  setSelectedConversation,
  addMessage,
  setOnlineUsers,
  addTypingUser,
  removeTypingUser
} = chatSlice.actions;

export default chatSlice.reducer;
