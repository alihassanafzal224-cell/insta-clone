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
    messages: {}, // { conversationId: [] }
    onlineUsers: [],
    typingUsers: {}, // { conversationId: [user] }
    loading: false,
    error: null,
  },

  reducers: {
    setSelectedConversation(state, action) {
      state.selectedConversation = action.payload;
    },

    /* --------- OPTIMISTIC ADD MESSAGE --------- */
    addMessage(state, action) {
      const { conversationId, message } = action.payload;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      state.messages[conversationId].push(message);

      // update lastMessage
      const conv = state.conversations.find(c => c._id === conversationId);
      if (conv) conv.lastMessage = message;
    },

    /* --------- REPLACE TEMP MESSAGE --------- */
    replaceMessage(state, action) {
      const { conversationId, tempId, message } = action.payload;

      const msgs = state.messages[conversationId];
      if (!msgs) return;

      const index = msgs.findIndex(m => m._id === tempId);
      if (index !== -1) {
        msgs[index] = message;
      }

      // update lastMessage if needed
      const conv = state.conversations.find(c => c._id === conversationId);
      if (conv?.lastMessage?._id === tempId) {
        conv.lastMessage = message;
      }
    },

    /* --------- ONLINE / TYPING --------- */
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },

    addTypingUser(state, action) {
      const { conversationId, user } = action.payload;

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      if (!state.typingUsers[conversationId].some(u => u._id === user._id)) {
        state.typingUsers[conversationId].push(user);
      }
    },

    removeTypingUser(state, action) {
      const { conversationId, userId } = action.payload;

      state.typingUsers[conversationId] =
        state.typingUsers[conversationId]?.filter(u => u._id !== userId) || [];
    },

    /* --------- SEEN STATUS --------- */
    markMessagesSeen(state, action) {
      const { conversationId, userId } = action.payload;

      state.messages[conversationId]?.forEach(msg => {
        if (!msg.seenBy?.includes(userId)) {
          msg.seenBy.push(userId);
        }
      });
    },
  },

  /* -------------------- EXTRA REDUCERS -------------------- */
  extraReducers: builder => {
    builder
      /* ---- FETCH CONVERSATIONS ---- */
      .addCase(fetchConversations.pending, state => {
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

      /* ---- FETCH MESSAGES ---- */
      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })

      /* ---- CREATE CONVERSATION ---- */
      .addCase(createConversation.fulfilled, (state, action) => {
        const exists = state.conversations.some(
          c => c._id === action.payload._id
        );
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
      });
  },
});

export const {
  setSelectedConversation,
  addMessage,
  replaceMessage,
  setOnlineUsers,
  addTypingUser,
  removeTypingUser,
  markMessagesSeen,
} = chatSlice.actions;

export default chatSlice.reducer;
