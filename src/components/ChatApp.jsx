import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../socket";
import {
  fetchConversations,
  fetchMessages,
  setSelectedConversation,
  addMessage,
  setOnlineUsers,
  addTypingUser,
  removeTypingUser
} from "../store/feauters/chatSlice";

function ChatApp() {
  const dispatch = useDispatch();
  const {
    conversations,
    selectedConversation,
    messages,
    onlineUsers,
    typingUsers
  } = useSelector((state) => state.chat);

  const [text, setText] = useState("");

  // 1️⃣ Load conversations on mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // 2️⃣ When selected conversation changes
  useEffect(() => {
    if (!selectedConversation) return;

    // Join socket room
    socket.emit("join-conversation", selectedConversation._id);

    // Load messages
    dispatch(fetchMessages(selectedConversation._id));
  }, [selectedConversation, dispatch]);

  // 3️⃣ Socket.IO event listeners
  useEffect(() => {
    socket.on("new-message", (message) => {
      dispatch(addMessage({ conversationId: message.conversationId, message }));
    });

    socket.on("typing", (userId) => {
      dispatch(addTypingUser(userId));
      setTimeout(() => dispatch(removeTypingUser(userId)), 2000);
    });

    socket.on("online-users", (userIds) => {
      dispatch(setOnlineUsers(userIds));
    });

    return () => {
      socket.off("new-message");
      socket.off("typing");
      socket.off("online-users");
    };
  }, [dispatch]);

  // 4️⃣ Send message
  const handleSend = () => {
    if (!text.trim() || !selectedConversation) return;

    socket.emit("send-message", {
      conversationId: selectedConversation._id,
      text
    });

    setText("");
  };

  // 5️⃣ Typing indicator
  const handleTyping = () => {
    if (!selectedConversation) return;
    socket.emit("typing", selectedConversation._id);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Conversations list */}
      <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: "10px" }}>
        <h3>Conversations</h3>
        {conversations.map((conv) => {
          const other = conv.participants.find(
            (u) => u._id !== "YOUR_LOGGED_IN_USER_ID" // replace dynamically
          );
          return (
            <div
              key={conv._id}
              onClick={() => dispatch(setSelectedConversation(conv))}
              style={{ cursor: "pointer", margin: "5px 0" }}
            >
              {other?.username}{" "}
              {onlineUsers.includes(other?._id) ? "(Online)" : "(Offline)"}
            </div>
          );
        })}
      </div>

      {/* Chat window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "10px" }}>
        <h3>{selectedConversation ? "Chat" : "Select a conversation"}</h3>
        <div style={{ flex: 1, overflowY: "auto", border: "1px solid #eee", padding: "10px" }}>
          {selectedConversation &&
            (messages[selectedConversation._id] || []).map((msg) => (
              <div key={msg._id} style={{ margin: "5px 0" }}>
                <b>{msg.sender.username}:</b> {msg.text}
              </div>
            ))}

          {typingUsers && typingUsers.length > 0 && (
            <div>{typingUsers.join(", ")} is typing...</div>
          )}
        </div>

        {/* Message input */}
        {selectedConversation && (
          <div style={{ display: "flex", marginTop: "10px" }}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleTyping}
              style={{ flex: 1, padding: "5px" }}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatApp;
