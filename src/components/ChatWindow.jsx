import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, addMessage } from "../store/feauters/chatSlice";
import { socket } from "../socket";
import MessageBubble from "./chat/MessageBubble";

export default function ChatWindow() {
  const { conversationId } = useParams();

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const messages = useSelector(
    (state) => state.chat.messages[conversationId]
  );



  const [text, setText] = useState("");

  // Fetch messages when conversationId changes
  useEffect(() => {
    if (!conversationId) return;
    dispatch(fetchMessages(conversationId));
    socket.emit("join-conversation", conversationId);
  }, [conversationId, dispatch]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on("new-message", (message) => {
      if (message.conversationId === conversationId) {
        dispatch(addMessage({ conversationId, message }));
      }
    });

    return () => {
      socket.off("new-message");
    };
  }, [conversationId, dispatch]);

  const handleSend = () => {
    if (!text.trim()) return;

    const message = {
      conversationId,
      sender: user._id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    // Send message via socket
    socket.emit("send-message", message);

    setText("");
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 font-semibold">
        Conversation: {conversationId}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {(messages || []).map((msg) => (
          <MessageBubble
            key={msg._id || msg.createdAt}
            message={msg}
            isOwn={String(msg.sender) === String(user._id)}
          />
        ))}

      </div>

      <div className="border-t p-3 flex space-x-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleEnter}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
