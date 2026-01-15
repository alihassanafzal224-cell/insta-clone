import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setConversationUnread,
  addMessage
} from "../../store/feauters/chatSlice";
import ConversationItem from "./ConversationItem";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../../socket";

export default function ChatLayout({ isCollapsed, setIsCollapsed }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId: activeConversationId } = useParams();

  const { conversations, onlineUsers, currentUser } = useSelector(state => state.chat);
  const user = useSelector(state => state.auth.user);

  /* ---------------- SOCKET LISTENERS ---------------- */
  useEffect(() => {
    if (!currentUser?._id) return;

    const handleNewMessage = (msg) => {
      dispatch(addMessage({
        conversationId: msg.conversationId,
        message: msg
      }));
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [dispatch, currentUser?._id]);

  /* ---------------- HANDLE CLICK ---------------- */
  const handleConversationClick = (conv) => {
    // Instagram-exact: ONLY reset unread when user explicitly clicks
    dispatch(setConversationUnread({
      conversationId: conv._id,
      unreadCount: 0
    }));

    socket.emit("open-conversation", conv._id);
    navigate(`/messages/${conv._id}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with hamburger button */}
      <div className="p-4 py-3.5 flex items-center justify-between border-b border-gray-300 ">
        <div className="flex items-center gap-3">
          {/* Hamburger button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Messages title - hidden when collapsed */}
          {!isCollapsed && <h3 className="font-semibold">Messages</h3>}
        </div>
      </div>

      {/* Conversation list - full view when expanded */}
      {!isCollapsed ? (
        <div className="overflow-y-auto">
          {conversations.map(conv => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
              currentUser={user}
              onlineUsers={onlineUsers}
              active={conv._id === activeConversationId}
              onClick={() => handleConversationClick(conv)}
            />
          ))}
        </div>
      ) : (
        /* Collapsed view - mini avatars only */
        <div className="overflow-y-auto py-2">
          {conversations.map(conv => {
            // Find the other user in conversation
            const otherParticipant = conv.participants?.find(p => p._id !== user?._id);
            
            return (
              <button
                key={conv._id}
                onClick={() => handleConversationClick(conv)}
                className={`
                  w-full p-3 flex items-center justify-center relative
                  hover:bg-gray-100 transition-colors
                  ${conv._id === activeConversationId ? "bg-blue-50" : ""}
                `}
                title={otherParticipant?.name || "Conversation"}
              >
                <div className="relative">
                  {otherParticipant?.avatar ? (
                    <img 
                      src={otherParticipant.avatar} 
                      alt={otherParticipant.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">
                        {(otherParticipant?.name?.[0] || "U").toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Online indicator */}
                  {onlineUsers.includes(otherParticipant?._id) && (
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                  )}
                  
                  {/* Unread indicator */}
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}