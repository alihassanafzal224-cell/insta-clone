import { useEffect } from "react";
import { useSelector } from "react-redux";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./layouts/Home";
import { socket } from "./socket";

function App() {
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      socket.auth = { token: user.token }; // or cookie-based auth
      socket.connect();

      console.log("Socket connecting...");
    } else {
      socket.disconnect();
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return user ? <Home /> : <AuthLayout />;
}

export default App;
