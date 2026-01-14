import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./layouts/Home";
import { socket } from "./socket";

import {
  fetchConversations,
  setOnlineUsers,
  addMessage,
  setConversationUnread,
  markMessagesSeen
} from "./store/feauters/chatSlice";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(state => state.auth.user);

  /* SOCKET CONNECT */
  useEffect(() => {
    if (!user) {
      socket.disconnect();
      return;
    }

    socket.auth = { token: user.token };
    socket.connect();

    return () => socket.disconnect();
  }, [user]);

  /* FETCH CONVERSATIONS */
  useEffect(() => {
    if (user) dispatch(fetchConversations());
  }, [user, dispatch]);

  /* SOCKET LISTENERS */
  useEffect(() => {
    if (!user) return;

    socket.on("online-users", users => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("new-message", message => {
      dispatch(addMessage({
        conversationId: message.conversationId,
        message
      }));
    });

    socket.on("conversation-unread-update", data => {
      dispatch(setConversationUnread(data));
    });

    socket.on("messages-seen", ({ conversationId, userId }) => {
      dispatch(markMessagesSeen({ conversationId, userId }));
    });

    return () => {
      socket.off("online-users");
      socket.off("new-message");
      socket.off("conversation-unread-update");
      socket.off("messages-seen");
    };
  }, [dispatch, user]);

  return user ? <Home /> : <AuthLayout />;
}

export default App;