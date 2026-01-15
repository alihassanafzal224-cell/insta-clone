import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket";
import EmojiPicker from "emoji-picker-react"; 
import { Smile, X, Play } from "lucide-react";

import {
  addMessage,
  replaceMessage,
  removeTempMessage,
  sendMessageWithMedia,
  addTypingUser,
  removeTypingUser
} from "../../store/feauters/chatSlice";
import { v4 as uuid } from "uuid";

export default function ChatInput({ conversationId }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);
  const typingUsers = useSelector(
    state => state.chat.typingUsers[conversationId] || []
  );

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const emojiRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  /* LISTEN FOR TYPING */
  useEffect(() => {
    socket.on("typing", ({ conversationId: cid, user }) => {
      if (cid === conversationId) {
        dispatch(addTypingUser({ conversationId: cid, user }));
      }
    });

    socket.on("stop-typing", ({ conversationId: cid, userId }) => {
      if (cid === conversationId) {
        dispatch(removeTypingUser({ conversationId: cid, userId }));
      }
    });

    return () => {
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, [conversationId, dispatch]);

  /* CLEANUP PREVIEWS */
  useEffect(() => {
    return () => {
      filePreviews.forEach(p => {
        if (p.url?.startsWith("blob:")) {
          URL.revokeObjectURL(p.url);
        }
      });
    };
  }, [filePreviews]);

  /* CLOSE EMOJI PICKER ON OUTSIDE CLICK */
  useEffect(() => {
    const handler = e => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* FILE HANDLING */
  const handleFiles = e => {
    const selected = Array.from(e.target.files);
    const previews = selected.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
      isVideo: file.type.startsWith("video/"),
      name: file.name,
      size: file.size
    }));

    setFiles(prev => [...prev, ...selected]);
    setFilePreviews(prev => [...prev, ...previews]);
  };

  const removeFile = index => {
    const preview = filePreviews[index];
    if (preview?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(preview.url);
    }

    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  /* TYPING */
  const handleTyping = e => {
    setText(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { conversationId });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("stop-typing", { conversationId });
    }, 1000);
  };

  /* SEND MESSAGE */
  const sendMessage = () => {
    if (!text.trim() && !files.length) return;

    const tempId = uuid();

    socket.emit("stop-typing", { conversationId });
    isTypingRef.current = false;
    setShowEmoji(false); // Close emoji picker when sending

    const optimisticMessage = {
      _id: tempId,
      tempId,
      conversationId,
      sender: currentUser,
      text,
      media: filePreviews.map(p => ({
        url: p.url,
        type: p.type,
        uploading: true,
        name: p.name
      })),
      uploading: files.length > 0,
      createdAt: new Date().toISOString(),
      seenBy: [currentUser._id]
    };

    dispatch(addMessage({ conversationId, message: optimisticMessage }));

    dispatch(
      sendMessageWithMedia({
        conversationId,
        text,
        files,
        tempId
      })
    )
      .unwrap()
      .then(realMessage => {
        dispatch(
          replaceMessage({
            conversationId,
            tempId,
            message: realMessage
          })
        );
      })
      .catch(() => {
        dispatch(removeTempMessage({ conversationId, tempId }));
      });

    setText("");
    setFiles([]);
    setFilePreviews([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addEmoji = (emojiData, event) => {
    const emoji = emojiData.emoji;
    const input = inputRef.current;

    if (!input) {
      setText(prev => prev + emoji);
      return;
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;

    const newText = text.slice(0, start) + emoji + text.slice(end);
    setText(newText);

    // Keep focus and cursor position after emoji insertion
    requestAnimationFrame(() => {
      input.focus();
      input.selectionStart = input.selectionEnd = start + emoji.length;
      
      // Trigger typing event when adding emoji
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        socket.emit("typing", { conversationId });
      }
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        socket.emit("stop-typing", { conversationId });
      }, 1000);
    });
  };

  /* HANDLE ENTER KEY */
  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t p-4 bg-white space-y-2 relative">
      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <p className="text-xs text-gray-500 animate-pulse">
          {typingUsers.map(u => u.name).join(", ")} typing...
        </p>
      )}

      {/* File previews */}
      {filePreviews.length > 0 && (
        <div className="flex gap-3  pb-2">
          {filePreviews.map((p, i) => (
            <div
              key={i}
              className="relative w-24 h-24 rounded-lg  border shrink-0"
            >
              {p.isVideo ? (
                <div className="relative w-full h-full bg-black">
                  <video
                    src={p.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={p.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => removeFile(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2">
        {/* File upload button */}
        <button
          onClick={() => fileRef.current.click()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Attach files"
        >
          <span className="text-lg">+</span>
        </button>

        {/* Emoji button */}
        <button
          onClick={() => setShowEmoji(v => !v)}
          className={`p-2 rounded-full transition-colors ${
            showEmoji ? "bg-gray-100" : "hover:bg-gray-100"
          }`}
          title="Insert emoji"
        >
          <Smile size={20} className={showEmoji ? "text-blue-500" : "text-gray-600"} />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/*,video/*"
          onChange={handleFiles}
        />

        {/* Text input */}
        <input
          ref={inputRef}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="Type a message..."
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
        />

        {/* Send button */}
        <button
          onClick={sendMessage}
          disabled={!text.trim() && !files.length}
          className="bg-blue-500 text-white px-4 py-2 rounded-full disabled:opacity-50 hover:bg-blue-600 transition-colors disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>

      {/* Emoji picker - Using emoji-picker-react */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="absolute bottom-20 left-4 z-50 shadow-lg rounded-lg overflow-hidden"
        >
          <EmojiPicker
            onEmojiClick={addEmoji}
            theme="light"
            height={350}
            width={300}
            previewConfig={{
              showPreview: false
            }}
            searchDisabled={false}
            skinTonesDisabled={true}
            categories={[
              "suggested",
              "smileys_people",
              "animals_nature",
              "food_drink",
              "travel_places",
              "activities",
              "objects",
              "symbols",
              "flags"
            ]}
          />
        </div>
      )}
    </div>
  );
}