import Footer from "../components/Footer";
import ChatLayout from "../components/chat/ChatLayout";
import { Outlet } from "react-router-dom";

export default function Messages() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <input/>

      <button >
        Send
      </button>
      <Footer />
    </div>
  );
}
