import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations, setOnlineUsers } from "../../store/feauters/chatSlice";
import { socket } from "../../socket";
import ConversationItem from "./ConversationItem";
import { useNavigate } from "react-router-dom";

export default function ChatLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversations, onlineUsers } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    socket.on("online-users", (users) => {
      dispatch(setOnlineUsers(users));
    });

    return () => socket.off("online-users");
  }, [dispatch]);

  return (
    <div className="w-1/3 border-r">
      <h3 className="p-4 font-semibold">Messages</h3>

      {conversations.map((conv) => (
        <ConversationItem
          key={conv._id}
          conversation={conv}
          currentUser={user}
          onlineUsers={onlineUsers}
          onClick={() => navigate(`/messages/${conv._id}`)}
        />
      ))}
    </div>
  );
}
