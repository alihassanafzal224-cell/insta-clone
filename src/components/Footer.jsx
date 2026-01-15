import {
  Home,
  PlusSquare,
  User,
  Search,
  MessageCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUnreadConversationCount, addMessage, setConversationUnread } from "../store/feauters/chatSlice";
import { useEffect } from "react";
import { socket } from "../socket";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loggedInUser = useSelector(state => state.auth.user);

  // Total unread messages across all conversations
  const totalUnread = useSelector(selectUnreadConversationCount);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/" ? "text-black" : "text-gray-500";
    return location.pathname.startsWith(path) ? "text-black" : "text-gray-500";
  };

  // ---------------- SOCKET LISTENERS ----------------
  useEffect(() => {
    if (!loggedInUser?._id) return;

    // New message received
    const handleNewMessage = (msg) => {
      dispatch(addMessage({
        conversationId: msg.conversationId,
        message: msg
      }));
    };

    // Unread count update from server
    const handleUnreadUpdate = ({ conversationId, unreadCount }) => {
      // 🔒 INSTAGRAM-EXACT GUARD:
      // Ignore unread resets when user is just viewing /messages inbox
      // and NOT inside a specific conversation
      if (
        unreadCount === 0 &&
        location.pathname === "/messages"
      ) {
        return;
      }

      dispatch(setConversationUnread({ conversationId, unreadCount }));
    };

    socket.on("new-message", handleNewMessage);
    socket.on("conversation-unread-update", handleUnreadUpdate);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("conversation-unread-update", handleUnreadUpdate);
    };
  }, [dispatch, loggedInUser?._id, location.pathname]);

  return (
    <footer className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-300 z-50">
      <div className="flex justify-around items-center h-14 px-4">
        <button 
          onClick={() => navigate("/")} 
          className={`cursor-pointer ${isActive("/")}`}
        >
          <Home />
        </button>

        <button 
          onClick={() => navigate("/search")} 
          className={`cursor-pointer ${isActive("/search")}`}
        >
          <Search />
        </button>

        <button
          onClick={() => navigate("/messages")}
          className={`relative cursor-pointer ${isActive("/messages")}`}
        >
          <MessageCircle />
          {totalUnread > 0 && (
            <span className="
              absolute -top-1 -right-1
              bg-red-500 text-white text-xs
              min-w-4.5 h-4.5
              flex items-center justify-center
              rounded-full px-1
              cursor-pointer
            ">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>

        <button 
          onClick={() => navigate("/post")} 
          className={`cursor-pointer ${isActive("/post")}`}
        >
          <PlusSquare />
        </button>

        <button 
          onClick={() => navigate("/profile")} 
          className={`cursor-pointer ${isActive("/profile")}`}
        >
          <User />
        </button>
      </div>
    </footer>
  );
}