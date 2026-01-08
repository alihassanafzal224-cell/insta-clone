import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  addMessage,
  markMessagesSeen,
  addTypingUser,
  removeTypingUser,
  replaceMessage
} from "../store/feauters/chatSlice";
import { socket } from "../socket";
import MessageBubble from "./chat/MessageBubble";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const messages =
    useSelector(state => state.chat.messages[conversationId]) ?? [];

  const bottomRef = useRef(null);

  /* ---------- FETCH + JOIN ---------- */
  useEffect(() => {
    if (!conversationId) return;

    dispatch(fetchMessages(conversationId));
    socket.emit("join-conversation", conversationId);
    socket.emit("mark-seen", { conversationId });

    return () => {
      socket.emit("leave-conversation", conversationId);
    };
  }, [conversationId, dispatch]);

  /* ---------- SOCKET LISTENERS ---------- */
  useEffect(() => {
    socket.on("new-message", message => {
      dispatch(
        addMessage({
          conversationId: message.conversationId,
          message
        })
      );

      if (message.conversationId === conversationId) {
        socket.emit("mark-seen", { conversationId });
      }
    });

    socket.on("message-uploaded", ({ tempId, message }) => {
      dispatch(
        replaceMessage({
          conversationId: message.conversationId,
          tempId,
          message
        })
      );
    });

    socket.on("messages-seen", ({ conversationId, userId }) => {
      dispatch(markMessagesSeen({ conversationId, userId }));
    });

    socket.on("typing", ({ conversationId, user }) => {
      dispatch(addTypingUser({ conversationId, user }));
    });

    socket.on("stop-typing", ({ conversationId, userId }) => {
      dispatch(removeTypingUser({ conversationId, userId }));
    });

    return () => {
      socket.off("new-message");
      socket.off("message-uploaded");
      socket.off("messages-seen");
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, [dispatch, conversationId]);

  /* ---------- AUTO SCROLL ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastMessageId = messages[messages.length - 1]?._id;

  return (
    <div className="p-4 overflow-y-auto h-[90%]">
      {messages.map(msg => (
        <MessageBubble
          key={msg._id}
          message={msg}
          isOwn={String(msg.sender?._id) === String(user._id)}
          isLast={msg._id === lastMessageId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
