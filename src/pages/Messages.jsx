import Footer from "../components/Footer";
import ChatLayout from "../components/chat/ChatLayout";
import ChatInput from "../components/chat/ChatInput";
import ChatHeader from "../components/chat/ChatHeader";
import { Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setConversationUnread, addMessage } from "../store/feauters/chatSlice";
import { socket } from "../socket";

export default function Messages() {
  const { conversationId } = useParams();
  const dispatch = useDispatch();

  const conversations = useSelector(state => state.chat.conversations);
  const loggedInUser = useSelector(state => state.auth.user);
  
  // State for sidebar collapse
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  // Join/leave socket room when conversation changes
  // DO NOT reset unread here - only when user explicitly clicks a conversation
  useEffect(() => {
    if (!conversationId) return;

    // ONLY join socket room
    socket.emit("open-conversation", conversationId);

    return () => {
      socket.emit("leave-conversation", conversationId);
    };
  }, [conversationId]);

  // Listen for new messages and unread updates
  useEffect(() => {
    if (!loggedInUser?._id) return;

    // New message received
    const handleNewMessage = (msg) => {
      dispatch(addMessage(msg));
    };

    // Unread count update from server
    const handleUnreadUpdate = ({ conversationId, unreadCount }) => {
      dispatch(setConversationUnread({ conversationId, unreadCount }));
    };

    socket.on("new-message", handleNewMessage);
    socket.on("conversation-unread-update", handleUnreadUpdate);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("conversation-unread-update", handleUnreadUpdate);
    };
  }, [dispatch, loggedInUser?._id]);

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-pink-50 via-purple-50 to-indigo-50">
      <header className="bg-white border-b border-gray-300  fixed top-0 w-full z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <h1 className="text-2xl font-serif">Instagram</h1>
        </div>
      </header>

      <div className="pt-14 flex flex-1 overflow-hidden">
        {/* Sidebar with dynamic width */}
        <div
          className={`
            bg-white border-b border-gray-300 overflow-y-auto
            transition-all duration-300 ease-in-out
            ${isChatCollapsed ? "w-16" : "w-90"}
          `}
        >
          <ChatLayout
            isCollapsed={isChatCollapsed}
            setIsCollapsed={setIsChatCollapsed}
          />
        </div>

        {/* Chat window that grows when sidebar collapses */}
        <div className={`
          flex flex-col h-[90%] transition-all duration-300 ease-in-out
          ${isChatCollapsed ? "w-[calc(100%-4rem)]" : "flex-1"}
        `}>
          {conversationId && (
            <ChatHeader
              isSidebarCollapsed={isChatCollapsed}
              onToggleSidebar={() => setIsChatCollapsed(!isChatCollapsed)}
            />
          )}
          <div className="flex-1 overflow-y-auto w-full ">
            <Outlet />
          </div>
          {conversationId && <ChatInput conversationId={conversationId} />}
        </div>
      </div>

      <Footer />
    </div>
  );
}