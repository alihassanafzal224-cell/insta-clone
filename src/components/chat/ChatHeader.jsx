import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

export default function ChatHeader() {
  const { conversationId } = useParams();
  const { conversations, onlineUsers } = useSelector(state => state.chat);
  const currentUser = useSelector(state => state.auth.user);

  const conversation = conversations.find(
    c => c._id === conversationId
  );

  if (!conversation) return null;

  const otherUser = conversation.participants.find(
    u => u._id !== currentUser._id
  );

  const isOnline = onlineUsers.includes(otherUser._id);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
      <div className="relative">
        <img
          src={otherUser.avatar || "/default-avatar.png"}
          alt={otherUser.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div>
        <p className="font-semibold">{otherUser.username}</p>
        <p className="text-xs text-gray-500">
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>
    </div>
  );
}
