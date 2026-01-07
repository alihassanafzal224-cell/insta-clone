import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, addMessage } from "../store/feauters/chatSlice";
import { socket } from "../socket";
import MessageBubble from "./chat/MessageBubble";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const messages = useSelector(
    state => state.chat.messages[conversationId] || []
  );

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    dispatch(fetchMessages(conversationId));
    socket.emit("join-conversation", conversationId);
  }, [conversationId, dispatch]);

  useEffect(() => {
    socket.on("new-message", message => {
      dispatch(addMessage({ conversationId: message.conversationId, message }));
    });

    return () => socket.off("new-message");
  }, [dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-4 overflow-y-auto h-[90%]">
      {messages.map(msg => (
        <MessageBubble
          key={msg._id}
          message={msg}
          isOwn={String(msg.sender?._id) === String(user._id)}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
