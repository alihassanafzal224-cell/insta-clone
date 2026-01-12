import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  clearUnread
} from "../store/feauters/chatSlice";
import MessageBubble from "./chat/MessageBubble";

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
    dispatch(clearUnread(conversationId));
  }, [conversationId, dispatch]);

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
