import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversations,
  setConversationUnread,
  addMessage
} from "../../store/feauters/chatSlice";
import ConversationItem from "./ConversationItem";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../../socket";

export default function ChatLayout() {
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
    <div className="border-r h-full">
      <h3 className="p-4 font-semibold">Messages</h3>

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
  );
}