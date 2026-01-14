export default function ConversationItem({
  conversation,
  currentUser,
  onlineUsers,
  onClick,
  active
}) {
  const otherUser = conversation.participants?.find(
    u => u._id !== currentUser._id
  );

  const isOnline = onlineUsers.includes(otherUser?._id);

  const activeClass = active
    ? "bg-blue-50 border-l-4 border-blue-500"
    : "hover:bg-gray-50";

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return "No messages yet";
    const lastMessage = conversation.lastMessage;

    if (lastMessage.media?.length) {
      const mediaCount = lastMessage.media.length;
      const isVideo = lastMessage.media.some(m =>
        typeof m === "string"
          ? m.match(/\.(mp4|webm|mov)$/i)
          : m.type?.startsWith("video/")
      );
      if (mediaCount === 1) return isVideo ? "📹 Video" : "📷 Photo";
      return `📁 ${mediaCount} ${isVideo ? "videos" : "photos"}`;
    }

    if (lastMessage.text)
      return lastMessage.text.length > 30
        ? lastMessage.text.slice(0, 30) + "..."
        : lastMessage.text;

    return "Message";
  };

  const formatTime = () => {
    if (!conversation.updatedAt) return "";
    const date = new Date(conversation.updatedAt);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0)
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7)
      return date.toLocaleDateString([], { weekday: "short" });

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getDisplayName = () =>
    otherUser?.name || otherUser?.username || "User";

  const getAvatar = () => otherUser?.avatar || "/default-avatar.png";

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors duration-150 border-b border-gray-100 ${activeClass}`}
    >
      <div className="relative shrink-0">
        <img
          src={getAvatar()}
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          alt={getDisplayName()}
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="font-semibold text-gray-800 truncate">
            {getDisplayName()}
          </p>

          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {formatTime()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {conversation.lastMessage?.sender?._id ===
            currentUser._id && (
              <span className="text-xs text-gray-500">You: </span>
            )}

          <p className="text-sm text-gray-500 truncate flex-1">
            {getLastMessagePreview()}
          </p>

          {conversation.unreadCount > 0 && !active && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {conversation.unreadCount}
            </span>
          )}

        </div>
      </div>
    </div>
  );
}
