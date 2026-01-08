import { useState, useRef } from "react";
import { socket } from "../../socket";

export default function ChatInput({ conversationId }) {
  const [text, setText] = useState("");
  const typing = useRef(false);
  const timeoutRef = useRef(null);

  const handleTyping = value => {
    setText(value);

    if (!typing.current) {
      typing.current = true;
      socket.emit("typing", { conversationId });
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      typing.current = false;
      socket.emit("stop-typing", { conversationId });
    }, 2000); // 2s idle before stop-typing
  };

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("send-message", {
      conversationId,
      text: text.trim(),
    });

    // Immediately stop typing on send
    if (typing.current) {
      typing.current = false;
      socket.emit("stop-typing", { conversationId });
    }

    setText("");
  };

  return (
    <div className="border-t p-3 flex gap-2 bg-white">
      <input
        className="flex-1 border rounded px-3 py-2"
        placeholder="Type a message..."
        value={text}
        onChange={e => handleTyping(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendMessage()}
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
}
