export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`message-bubble ${isOwn ? "own" : ""}`}>
      {message.text}
      <span className="time">
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })}
      </span>
    </div>
  );
}
