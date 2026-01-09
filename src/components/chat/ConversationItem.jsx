export default function ConversationItem({
  conversation,
  currentUser,
  onlineUsers,
  onClick,
  unreadCount
}) {
  // Find the other user in the conversation
  const otherUser = conversation.participants?.find(
    u => u._id !== currentUser._id
  );

  // If no other user found (shouldn't happen in 1-on-1 chat), fallback
  if (!otherUser) {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100"
      >
        <div className="relative">
          <img
            src="/default-avatar.png"
            className="w-10 h-10 rounded-full object-cover"
            alt="User"
          />
        </div>
        <div>
          <p className="font-semibold text-gray-800">Unknown User</p>
          <p className="text-sm text-gray-500">No messages yet</p>
        </div>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(otherUser._id);

  // Format last message preview
  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) {
      return "No messages yet";
    }

    const lastMessage = conversation.lastMessage;
    
    // Check if it's a media message
    if (lastMessage.media && lastMessage.media.length > 0) {
      const mediaCount = lastMessage.media.length;
      const isVideo = lastMessage.media.some(m => 
        typeof m === 'string' ? m.match(/\.(mp4|webm|mov)$/i) : m.type?.startsWith('video/')
      );
      
      if (mediaCount === 1) {
        return isVideo ? "📹 Video" : "📷 Photo";
      } else {
        return `📁 ${mediaCount} ${isVideo ? 'videos' : 'photos'}`;
      }
    }
    
    // Text message
    if (lastMessage.text) {
      // Truncate long messages
      if (lastMessage.text.length > 30) {
        return `${lastMessage.text.substring(0, 30)}...`;
      }
      return lastMessage.text;
    }
    
    // Empty message (shouldn't happen)
    return "Message";
  };

  // Format time
  const formatTime = () => {
    if (!conversation.updatedAt) return "";
    
    const date = new Date(conversation.updatedAt);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get user display name (prefer name over username)
  const getDisplayName = () => {
    // First check if user has a name property
    if (otherUser.name) {
      return otherUser.name;
    }
    // Fallback to username
    if (otherUser.username) {
      return otherUser.username;
    }
    // Last resort
    return "User";
  };

  // Get user avatar
  const getAvatar = () => {
    return otherUser.avatar || otherUser.profilePicture || "/default-avatar.png";
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors duration-150"
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
          {/* Check if last message is from current user */}
          {conversation.lastMessage?.sender?._id === currentUser._id && (
            <span className="text-xs text-gray-500">You: </span>
          )}
          
          <p className="text-sm text-gray-500 truncate flex-1">
            {getLastMessagePreview()}
          </p>
          
          {/* Unread count badge */}
          {/* {conversation.unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
              {conversation.unreadCount}
            </span>
          )} */}
        </div>
      </div>
    </div>
  );
}