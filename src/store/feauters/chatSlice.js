import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* -------------------- Thunks -------------------- */

// Fetch conversations
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8000/api/conversations", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch messages
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/messages/${conversationId}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      return { conversationId, messages: await res.json() };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Create conversation
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

/* -------------------- Slice -------------------- */

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    selectedConversation: null,
    messages: {},
    onlineUsers: [],
    typingUsers: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedConversation(state, action) {
      state.selectedConversation = action.payload;
    },

    addMessage(state, action) {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);

      // Update lastMessage in conversation list
      const conv = state.conversations.find(c => c._id === conversationId);
      if (conv) conv.lastMessage = message;
    },

    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },

    addTypingUser(state, action) {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },

    removeTypingUser(state, action) {
      state.typingUsers = state.typingUsers.filter(
        u => u !== action.payload
      );
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchConversations.pending, state => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      });
  },
});

export const {
  setSelectedConversation,
  addMessage,
  setOnlineUsers,
  addTypingUser,
  removeTypingUser,
} = chatSlice.actions;

export default chatSlice.reducer;
