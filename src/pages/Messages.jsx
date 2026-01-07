import Footer from "../components/Footer";
import ChatLayout from "../components/chat/ChatLayout";
import ChatInput from "../components/chat/ChatInput";
import { Outlet, useParams } from "react-router-dom";

export default function Messages() {
  const { conversationId } = useParams();

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header offset */}
      <div className="pt-16 flex flex-1 overflow-hidden">
        
        {/* Left panel */}
        <div className="w-1/3 border-r overflow-y-auto">
          <ChatLayout />
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>

          {/* Input (persistent) */}
          {conversationId && (
            <ChatInput conversationId={conversationId} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
