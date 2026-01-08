import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

export default function ChatHeader() {
  const { conversationId } = useParams();
  const { conversations, onlineUsers, typingUsers } = useSelector(
    state => state.chat
  );
  const currentUser = useSelector(state => state.auth.user);

  const conversation = conversations.find(c => c._id === conversationId);
  if (!conversation) return null;

  // Find other participants (exclude current user)
  const otherUsers = conversation.participants.filter(
    u => u._id !== currentUser._id
  );

  // Typing users in this conversation (exclude current user)
  const typingList = typingUsers?.[conversationId]?.filter(
    u => u._id !== currentUser._id
  ) || [];

  // Determine status text
  let statusText = "";
  if (typingList.length > 0) {
    const names = typingList.map(u => u.name).join(", ");
    statusText =
      typingList.length === 1 ? `${names} is typing…` : `${names} are typing…`;
  } else if (otherUsers.some(u => onlineUsers.includes(u._id))) {
    statusText = "Online";
  } else {
    statusText = "Offline";
  }

  // Check if any other user is online for green dot
  const isOnline = otherUsers.some(u => onlineUsers.includes(u._id));

  // Use first other user for avatar/name (for 1-to-1 chat)
  const displayUser = otherUsers[0];

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
      <div className="relative">
        <img
          src={displayUser.avatar || "/default-avatar.png"}
          alt={displayUser.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div>
        <p className="font-semibold">{displayUser.name}</p>
        <p className="text-xs text-gray-500">{statusText}</p>
      </div>
    </div>
  );
}
