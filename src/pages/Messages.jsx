import Footer from "../components/Footer";
import ChatLayout from "../components/chat/ChatLayout";
import ChatInput from "../components/chat/ChatInput";
import ChatHeader from "../components/chat/ChatHeader";
import { Outlet, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { socket } from "../socket";

import {
  fetchConversations,
  setOnlineUsers,
  addMessage,
  incrementUnread
} from "../store/feauters/chatSlice";

export default function Messages() {
  const dispatch = useDispatch();
  const { conversationId } = useParams();
  const { conversations } = useSelector(state => state.chat);

  /* FETCH CONVERSATIONS */
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  /* JOIN / LEAVE ALL CONVERSATIONS */
  useEffect(() => {
    if (!conversations.length) return;

    conversations.forEach(conv =>
      socket.emit("join-conversation", conv._id)
    );

    return () => {
      conversations.forEach(conv =>
        socket.emit("leave-conversation", conv._id)
      );
    };
  }, [conversations]);

  /* SOCKET LISTENERS */
  useEffect(() => {
    socket.on("online-users", users => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("new-message", message => {
      dispatch(
        addMessage({
          conversationId: message.conversationId,
          message
        })
      );

      if (message.conversationId !== conversationId) {
        dispatch(incrementUnread(message.conversationId));
      }
    });

    return () => {
      socket.off("online-users");
      socket.off("new-message");
    };
  }, [dispatch, conversationId]);

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-pink-50 via-purple-50 to-indigo-50">
      <header className="bg-white border-b fixed top-0 w-full z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <h1 className="text-2xl font-serif">Instagram</h1>
        </div>
      </header>

      <div className="pt-14 flex flex-1 overflow-hidden">
        <div className="w-90 bg-white border-r overflow-y-auto">
          <ChatLayout />
        </div>

        <div className="flex-1 flex flex-col h-[90%]">
          {conversationId && <ChatHeader />}

          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>

          {conversationId && (
            <ChatInput conversationId={conversationId} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
