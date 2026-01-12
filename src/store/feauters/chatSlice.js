import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* -------------------- THUNKS -------------------- */

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

// ✅ DO NOT CHANGE (kept exactly as requested)
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

// Send message (with file upload)
export const sendMessageWithMedia = createAsyncThunk(
  "chat/sendMessageWithMedia",
  async ({ conversationId, text, files, tempId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("tempId", tempId);

      if (files?.length) {
        files.forEach(file => formData.append("media", file));
      }

      const res = await fetch(
        `http://localhost:8000/api/messages/${conversationId}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send message");
      }

      return await res.json(); // real message
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* -------------------- SLICE -------------------- */

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    selectedConversation: null,
    messages: {},
    onlineUsers: [],
    typingUsers: {},
    loading: false,
    error: null,
  },

  reducers: {
    setSelectedConversation(state, action) {
      state.selectedConversation = action.payload;
    },

    /* --------- ADD MESSAGE (OPTIMISTIC / SOCKET) --------- */
    addMessage(state, action) {
      const { conversationId, message } = action.payload;

      state.messages[conversationId] ??= [];

      const exists = state.messages[conversationId].some(
        m => m._id === message._id || m.tempId === message.tempId
      );
      if (!exists) {
        state.messages[conversationId].push(message);
      }

      const convIndex = state.conversations.findIndex(c => c._id === conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;
        state.conversations[convIndex].updatedAt = new Date().toISOString();

        const [conv] = state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
    },

    /* --------- REPLACE TEMP MESSAGE --------- */
    replaceMessage(state, action) {
      const { conversationId, tempId, message } = action.payload;
      const msgs = state.messages[conversationId];
      if (!msgs) return;

      const index = msgs.findIndex(
        m => m.tempId === tempId || m._id === tempId
      );
      if (index !== -1) {
        msgs[index] = message;
      }
    },

    /* --------- REMOVE TEMP MESSAGE --------- */
    removeTempMessage(state, action) {
      const { conversationId, tempId } = action.payload;
      state.messages[conversationId] =
        state.messages[conversationId]?.filter(
          m => m.tempId !== tempId && m._id !== tempId
        ) || [];
    },

    /* --------- ONLINE / TYPING --------- */
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },

    addTypingUser(state, action) {
      const { conversationId, user } = action.payload;
      state.typingUsers[conversationId] ??= [];
      if (!state.typingUsers[conversationId].some(u => u._id === user._id)) {
        state.typingUsers[conversationId].push(user);
      }
    },

    removeTypingUser(state, action) {
      const { conversationId, userId } = action.payload;
      state.typingUsers[conversationId] =
        state.typingUsers[conversationId]?.filter(u => u._id !== userId) || [];
    },

    /* --------- SEEN --------- */
    markMessagesSeen(state, action) {
      const { conversationId, userId } = action.payload;
      state.messages[conversationId]?.forEach(msg => {
        msg.seenBy ??= [];
        if (!msg.seenBy.includes(userId)) {
          msg.seenBy.push(userId);
        }
      });
    },

    incrementUnread(state, action) {
      const conv = state.conversations.find(c => c._id === action.payload);
      if (conv) conv.unreadCount = (conv.unreadCount || 0) + 1;
    },

    clearUnread(state, action) {
      const conv = state.conversations.find(c => c._id === action.payload);
      if (conv) conv.unreadCount = 0;
    },
  },

  /* -------------------- EXTRA REDUCERS -------------------- */
  extraReducers: builder => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = [...action.payload].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      })

      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      })

      .addCase(createConversation.fulfilled, (state, action) => {
        const exists = state.conversations.some(
          c => c._id === action.payload._id
        );
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
      })

      /* ❗ Do NOT mutate state here — handled by replaceMessage */
      .addCase(sendMessageWithMedia.fulfilled, () => {});
  },
});

export const {
  setSelectedConversation,
  addMessage,
  replaceMessage,
  removeTempMessage,
  setOnlineUsers,
  addTypingUser,
  removeTypingUser,
  markMessagesSeen,
  incrementUnread,
  clearUnread,
} = chatSlice.actions;

export default chatSlice.reducer;
