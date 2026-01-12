import {
  Home,
  PlusSquare,
  User,
  Search,
  MessageCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUnreadConversationCount } from "../store/feauters/chatSlice";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUser = useSelector(state => state.auth.user);

  // ✅ INSTAGRAM-STYLE COUNT
  const totalUnread = useSelector(selectUnreadConversationCount);

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/" ? "text-black" : "text-gray-500";
    }
    return location.pathname.startsWith(path)
      ? "text-black"
      : "text-gray-500";
  };

  return (
    <footer className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-300 z-50">
      <div className="flex justify-around items-center h-14 px-4">

        <button onClick={() => navigate("/")} className={isActive("/")}>
          <Home />
        </button>

        <button onClick={() => navigate("/search")} className={isActive("/search")}>
          <Search />
        </button>

        <button
          onClick={() => navigate("/messages")}
          className={`relative ${isActive("/messages")}`}
        >
          <MessageCircle />

          {totalUnread > 0 && (
            <span className="
              absolute -top-1 -right-1
              bg-red-500 text-white text-xs
              min-w-4.5 h-4.5
              flex items-center justify-center
              rounded-full px-1
            ">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>

        <button onClick={() => navigate("/post")} className={isActive("/post")}>
          <PlusSquare />
        </button>

        <button onClick={() => navigate("/profile")} className={isActive("/profile")}>
          <User />
        </button>

      </div>
    </footer>
  );
}
