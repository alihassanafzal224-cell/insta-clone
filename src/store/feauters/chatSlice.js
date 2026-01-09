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

// Send message (with file upload)
export const sendMessageWithMedia = createAsyncThunk(
  "chat/sendMessageWithMedia",
  async ({ conversationId, text, files, tempId }, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("tempId", tempId);
      
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append("media", file);
        });
      }

      const res = await fetch(`http://localhost:8000/api/messages/${conversationId}`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send message");
      }

      return await res.json();
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
    sendingMessages: {} // Track sending messages by tempId
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

      // Check if message already exists (avoid duplicates)
      const exists = state.messages[conversationId].some(
        m => m._id === message._id || (message.tempId && m._id === message.tempId)
      );
      
      if (!exists) {
        state.messages[conversationId].push(message);
      }

      // Update conversation lastMessage and bring to top
      const convIndex = state.conversations.findIndex(c => c._id === conversationId);
      if (convIndex !== -1) {
        // Update the conversation's lastMessage
        state.conversations[convIndex].lastMessage = message;
        
        // Move conversation to top
        const [updatedConv] = state.conversations.splice(convIndex, 1);
        state.conversations.unshift(updatedConv);
        
        // Update timestamp
        state.conversations[0].updatedAt = new Date().toISOString();
      }
    },

    /* --------- REPLACE TEMP MESSAGE --------- */
    replaceMessage(state, action) {
      const { conversationId, tempId, message } = action.payload;

      const msgs = state.messages[conversationId];
      if (!msgs) return;

      // Find temp message
      const index = msgs.findIndex(m => m._id === tempId || (m.tempId && m.tempId === tempId));
      if (index !== -1) {
        msgs[index] = { ...message, tempId: undefined }; // Remove tempId from final message
      }

      // Also check for any other temp messages with same tempId
      const otherIndex = msgs.findIndex((m, i) => i !== index && (m._id === tempId || m.tempId === tempId));
      if (otherIndex !== -1) {
        msgs.splice(otherIndex, 1);
      }

      // Update conversation lastMessage if this was the last message
      const convIndex = state.conversations.findIndex(c => c._id === conversationId);
      if (convIndex !== -1) {
        const conv = state.conversations[convIndex];
        // If the replaced message was the last message, update it
        if (conv.lastMessage && 
            (conv.lastMessage._id === tempId || conv.lastMessage.tempId === tempId)) {
          state.conversations[convIndex].lastMessage = message;
        }
      }
    },

    /* --------- UPDATE CONVERSATION LAST MESSAGE --------- */
    updateConversationLastMessage(state, action) {
      const { conversationId, message } = action.payload;
      
      const convIndex = state.conversations.findIndex(c => c._id === conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;
        state.conversations[convIndex].updatedAt = new Date().toISOString();
        
        // Move to top
        const [updatedConv] = state.conversations.splice(convIndex, 1);
        state.conversations.unshift(updatedConv);
      }
    },

    /* --------- REMOVE TEMP MESSAGE --------- */
    removeTempMessage(state, action) {
      const { conversationId, tempId } = action.payload;
      
      const msgs = state.messages[conversationId];
      if (!msgs) return;
      
      state.messages[conversationId] = msgs.filter(
        m => m._id !== tempId && m.tempId !== tempId
      );
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

      // Also update last message seen status in conversations list
      const convIndex = state.conversations.findIndex(c => c._id === conversationId);
      if (convIndex !== -1 && state.conversations[convIndex].lastMessage) {
        const lastMessage = state.conversations[convIndex].lastMessage;
        if (!lastMessage.seenBy?.includes(userId)) {
          if (!lastMessage.seenBy) lastMessage.seenBy = [];
          lastMessage.seenBy.push(userId);
        }
      }
    },

    /* --------- UPDATE MESSAGE MEDIA --------- */
    updateMessageMedia(state, action) {
      const { conversationId, messageId, mediaUrls } = action.payload;
      
      const msgs = state.messages[conversationId];
      if (!msgs) return;
      
      const msgIndex = msgs.findIndex(m => m._id === messageId);
      if (msgIndex !== -1) {
        msgs[msgIndex].media = mediaUrls;
        msgs[msgIndex].uploading = false;
      }
    }
  },

  /* -------------------- EXTRA REDUCERS -------------------- */
  extraReducers: builder => {
    builder
      .addCase(fetchConversations.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        // Sort conversations by updatedAt (newest first)
        const sortedConversations = [...action.payload].sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        state.conversations = sortedConversations;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        // Sort by createdAt ascending
        messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        state.messages[conversationId] = messages;
      })

      .addCase(createConversation.fulfilled, (state, action) => {
        const exists = state.conversations.some(
          c => c._id === action.payload._id
        );
        if (!exists) {
          // Add new conversation at the top
          state.conversations.unshift(action.payload);
        }
      })

      .addCase(sendMessageWithMedia.pending, (state, action) => {
        const { conversationId, tempId } = action.meta.arg;
        state.sendingMessages[tempId] = true;
      })
      .addCase(sendMessageWithMedia.fulfilled, (state, action) => {
        const { conversationId, tempId } = action.meta.arg;
        const message = action.payload;
        
        // Remove temp message and add real one
        const msgs = state.messages[conversationId];
        if (msgs) {
          const tempIndex = msgs.findIndex(m => m._id === tempId || m.tempId === tempId);
          if (tempIndex !== -1) {
            msgs[tempIndex] = message;
          }
        }
        
        // Update conversation lastMessage and move to top
        const convIndex = state.conversations.findIndex(c => c._id === conversationId);
        if (convIndex !== -1) {
          state.conversations[convIndex].lastMessage = message;
          state.conversations[convIndex].updatedAt = new Date().toISOString();
          
          // Move conversation to top
          const [updatedConv] = state.conversations.splice(convIndex, 1);
          state.conversations.unshift(updatedConv);
        }
        
        delete state.sendingMessages[tempId];
      })
      .addCase(sendMessageWithMedia.rejected, (state, action) => {
        const { conversationId, tempId } = action.meta.arg;
        
        // Remove failed message
        const msgs = state.messages[conversationId];
        if (msgs) {
          state.messages[conversationId] = msgs.filter(
            m => m._id !== tempId && m.tempId !== tempId
          );
        }
        
        delete state.sendingMessages[tempId];
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedConversation,
  addMessage,
  replaceMessage,
  updateConversationLastMessage,
  removeTempMessage,
  setOnlineUsers,
  addTypingUser,
  removeTypingUser,
  markMessagesSeen,
  updateMessageMedia
} = chatSlice.actions;

export default chatSlice.reducer;