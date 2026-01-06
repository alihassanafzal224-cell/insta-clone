import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import HomePage from "../pages/HomePage";
import Post from "../pages/Post";
import Profile from "../pages/Profile";
import SearchPage from "../pages/SearchPage";
import EditProfile from "../components/EditProfile";
import Messages from "../pages/Messages"
import ChatWindow from "../components/ChatWindow"

export default function loginLayOut() {
  const user = useSelector((state) => state.auth.user);

  const route = (
    <>
      {/* Public routes */}
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
      <Route path="/search" element={<SearchPage />} />

      {/* Protected routes */}
      <Route
        path="/post"
        element={user ? <Post /> : <Navigate to="/login" />}
      />

      <Route
        path="/profile"
        element={user ? <Profile /> : <Navigate to="/" />}
      />

      <Route
        path="/profile/:userId"
        element={user ? <Profile /> : <Navigate to="/" />}
      />

      <Route
        path="/edit-profile"
        element={user ? <EditProfile /> : <Navigate to="/" />}
      />

      {/* Messages (nested) */}
      <Route
        path="/messages"
        element={user ? <Messages /> : <Navigate to="/login" />}
      >
        <Route path=":conversationId" element={<ChatWindow />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={user ? <Navigate to="/" /> : <Navigate to="/login" />} />
    </>
  );

  return <Routes>{route}</Routes>;
}
