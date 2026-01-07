import { useState } from "react";
import { useSelector } from "react-redux";
import { socket } from "../../socket";

export default function ChatInput({ conversationId }) {
  const [text, setText] = useState("");
  const user = useSelector((state) => state.auth.user);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("send-message", {
      conversationId,
      sender: user._id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    });

    setText("");
  };

  return (
    <div className="border-t p-3 flex gap-2 bg-white">
      <input
        type="text"
        className="flex-1 border rounded px-3 py-2"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={sendMessage}
      >
        Send
      </button>
    </div>
  );
}
