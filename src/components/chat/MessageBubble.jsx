export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`mb-2 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-3 py-2 rounded-lg max-w-xs ${
          isOwn ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        <p>{message.text}</p>
        <span className="text-xs opacity-70">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
