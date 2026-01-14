import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages
} from "../store/feauters/chatSlice";
import MessageBubble from "./chat/MessageBubble";
import { socket } from "../socket";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const messages =
    useSelector(state => state.chat.messages[conversationId]) ?? [];

  const bottomRef = useRef(null);

  /* FETCH MESSAGES */
  useEffect(() => {
    if (!conversationId) return;
    dispatch(fetchMessages(conversationId));
  }, [conversationId, dispatch]);
  
  /* JOIN SOCKET ROOM (without resetting unread) */
  useEffect(() => {
    if (conversationId) {
      // Only join room, don't reset unread
      socket.emit("open-conversation", conversationId);
      return () => socket.emit("leave-conversation", conversationId);
    }
  }, [conversationId]);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 h-[90%] ">
      {messages.map((msg, index) => (
        <MessageBubble
          key={msg._id || msg.tempId || index}
          message={msg}
          isOwn={String(msg.sender?._id) === String(user._id)}
          isLast={index === messages.length - 1}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}