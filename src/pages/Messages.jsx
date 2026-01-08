import Footer from "../components/Footer";
import ChatLayout from "../components/chat/ChatLayout";
import ChatInput from "../components/chat/ChatInput";
import { Outlet, useParams } from "react-router-dom";
import ChatHeader from "../components/chat/ChatHeader";

export default function Messages() {
  const { conversationId } = useParams();

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Top spacing for main navbar */}
      <div className="pt-16 flex flex-1 overflow-hidden">

        {/* Left panel – Conversations */}
        <div className="w-90 bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-sm overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b px-4 py-3">
            <h2 className="text-lg font-semibold bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Messages
            </h2>
          </div>
          <ChatLayout />
        </div>

        {/* Right panel – Chat */}
        <div className="flex-1 flex flex-col h-[90%] relative">

          {/* Header */}
          {conversationId && (
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b shadow-sm">
              <ChatHeader />
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
            <Outlet />
          </div>

          {/* Input */}
          {conversationId && (
            <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t shadow-lg">
              <ChatInput conversationId={conversationId} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur border-t">
        <Footer />
      </div>
    </div>
  );
}
