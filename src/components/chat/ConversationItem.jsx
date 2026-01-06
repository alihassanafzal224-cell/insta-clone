export default function ConversationItem({
  conversation,
  currentUser,
  onlineUsers,
  onClick
}) {
  const otherUser = conversation.participants.find(
    (u) => u._id !== currentUser._id
  );

  const isOnline = onlineUsers.includes(otherUser._id);

  return (
    <div className="conversation-item" onClick={onClick}>
      <div className="avatar">
        <img src={otherUser.profilePic} alt="" />
        {isOnline && <span className="online-dot" />}
      </div>
      <div className="conversation-info">
        <strong>{otherUser.username}</strong>
        <p>{conversation.lastMessage?.text || "No messages yet"}</p>
      </div>
    </div>
  );
}
