import { useSelector } from "react-redux";

export default function MessageBubble({ message, isOwn, isLast }) {
  const currentUser = useSelector(state => state.auth.user);

  // Seen = last message sent by me AND other user has seen it
  const isSeen =
    isOwn &&
    isLast &&
    message.seenBy?.some(
      userId => String(userId) !== String(currentUser._id)
    );

  return (
    <div className={`mb-2 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-3 py-2 rounded-lg max-w-xs ${
          isOwn ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        <p>{message.text}</p>

        <div className="flex justify-end gap-2 mt-1">
          <span className="text-xs opacity-70">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {/* Instagram-style Seen */}
          {isOwn && isLast && (
            <span className="text-xs opacity-70">
              {isSeen ? "Seen" : "Delivered"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
