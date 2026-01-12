import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversations,
  clearUnread
} from "../../store/feauters/chatSlice";
import ConversationItem from "./ConversationItem";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../../socket";

export default function ChatLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId: activeConversationId } = useParams();

  const { conversations, onlineUsers } = useSelector(state => state.chat);
  const user = useSelector(state => state.auth.user);

  /* FETCH CONVERSATIONS */
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  /* HANDLE CLICK */
  const handleConversationClick = conv => {
    dispatch(clearUnread(conv._id));
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
