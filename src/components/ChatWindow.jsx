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
  const messages = useSelector(state => state.chat.messages[conversationId]) ?? [];

  const bottomRef = useRef(null);

  /* ---------- FETCH + JOIN ---------- */
  useEffect(() => {
    if (!conversationId) return;

    dispatch(fetchMessages(conversationId));
    socket.emit("join-conversation", conversationId);
    
    // Mark messages as seen after a short delay
    const timer = setTimeout(() => {
      socket.emit("mark-seen", { conversationId });
    }, 500);

    return () => {
      socket.emit("leave-conversation", conversationId);
      clearTimeout(timer);
    };
  }, [conversationId, dispatch]);

  /* ---------- SOCKET LISTENERS ---------- */
  useEffect(() => {
    if (!conversationId) return;

    /* ---- NEW MESSAGE ---- */
    const handleNewMessage = (message) => {
      // If message has tempId, it's from current user - replace optimistic message
      if (message.tempId) {
        dispatch(replaceMessage({
          conversationId: message.conversationId,
          tempId: message.tempId,
          message
        }));
      } else {
        // If message is from other user - add it
        dispatch(addMessage({
          conversationId: message.conversationId,
          message
        }));
      }

      // If this message is in current conversation, mark as seen
      if (message.conversationId === conversationId) {
        socket.emit("mark-seen", { conversationId });
      }
    };

    /* ---- SEEN ---- */
    const handleMessagesSeen = ({ conversationId, userId }) => {
      dispatch(markMessagesSeen({ conversationId, userId }));
    };

    /* ---- TYPING ---- */
    const handleTyping = ({ conversationId, user }) => {
      dispatch(addTypingUser({ conversationId, user }));
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      dispatch(removeTypingUser({ conversationId, userId }));
    };

    /* ---- MEDIA UPLOADED ---- */
    const handleMediaUploaded = ({ conversationId, messageId }) => {
      // Refetch messages to get updated media URLs
      if (conversationId === conversationId) {
        dispatch(fetchMessages(conversationId));
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("messages-seen", handleMessagesSeen);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);
    socket.on("message-uploaded", handleMediaUploaded);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("messages-seen", handleMessagesSeen);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
      socket.off("message-uploaded", handleMediaUploaded);
    };
  }, [dispatch, conversationId]);

  /* ---------- AUTO SCROLL ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg">Start a conversation</p>
            <p className="text-sm">Send a message or media to get started</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg._id || msg.tempId || index}
              message={msg}
              isOwn={String(msg.sender?._id) === String(user._id)}
              isLast={index === messages.length - 1}
            />
          ))}
          <div ref={bottomRef} className="h-4" />
        </>
      )}
    </div>
  );
}