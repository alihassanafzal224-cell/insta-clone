import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  addMessage,
  markMessagesSeen,
  addTypingUser,
  removeTypingUser
} from "../store/feauters/chatSlice";
import { socket } from "../socket";
import MessageBubble from "./chat/MessageBubble";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const messages = useSelector(
    state => state.chat.messages[conversationId]
  ) ?? [];


  const bottomRef = useRef(null);

  // FETCH + JOIN CONVERSATION (MARK SEEN)
  useEffect(() => {
    if (!conversationId) return;

    dispatch(fetchMessages(conversationId));
    socket.emit("join-conversation", conversationId);

    // 🔑 notify server messages are seen
    socket.emit("mark-seen", { conversationId });
  }, [conversationId, dispatch]);


  // SOCKET LISTENERS
  useEffect(() => {
    socket.on("new-message", message => {
      dispatch(
        addMessage({
          conversationId: message.conversationId,
          message
        })
      )

      // 🔑 if this chat is open, mark as seen
      if (message.conversationId === conversationId) {
        socket.emit("join-conversation", conversationId);
      }
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
      socket.off("messages-seen");
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, [dispatch]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastMessageId = messages[messages.length - 1]?._id;

  return (
    <div className="p-4 overflow-y-auto h-[90%]">
      {messages && messages.map(msg => (
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
