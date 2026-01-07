export default function ConversationItem({
  conversation,
  currentUser,
  onlineUsers,
  onClick,
}) {
  const otherUser = conversation.participants.find(
    u => u._id !== currentUser._id
  );

  const isOnline = onlineUsers.includes(otherUser._id);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100"
    >
      <div className="relative">
        <img
          src={otherUser.avatar || "/default-avatar.png"}
          className="w-10 h-10 rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div>
        <p className="font-semibold">{otherUser.username}</p>
        <p className="text-sm text-gray-500 truncate max-w-45">
          {conversation.lastMessage?.text || "No messages yet"}
        </p>
      </div>
    </div>
  );
}
