import { useState } from "react";
import { socket } from "../../socket";

export default function ChatInput({ conversationId }) {
  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("send-message", {
      conversationId,
      text: text.trim(),
    });

    setText("");
  };

  return (
    <div className="border-t p-3 flex gap-2 bg-white">
      <input
        className="flex-1 border rounded px-3 py-2"
        placeholder="Type a message..."
        value={text}
        onChange={e => setText(e.target.value)}
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
