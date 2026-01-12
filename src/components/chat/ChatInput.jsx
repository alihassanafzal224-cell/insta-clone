import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket";
import {
  addMessage,
  replaceMessage,
  removeTempMessage,
  sendMessageWithMedia,
  addTypingUser,
  removeTypingUser
} from "../../store/feauters/chatSlice";
import { v4 as uuid } from "uuid";
import { X, Play } from "lucide-react";

export default function ChatInput({ conversationId }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);

  const typingUsers = useSelector(
    state => state.chat.typingUsers[conversationId] || []
  );

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const fileRef = useRef(null);

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

  return (
    <div className="border-t p-4 bg-white space-y-2">
      {typingUsers.length > 0 && (
        <p className="text-xs text-gray-500">
          {typingUsers.map(u => u.name).join(", ")} typing...
        </p>
      )}

      {filePreviews.length > 0 && (
        <div className="flex gap-3 overflow-x-auto">
          {filePreviews.map((p, i) => (
            <div
              key={i}
              className="relative w-24 h-24 rounded-lg overflow-hidden border"
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
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}

              <button
                onClick={() => removeFile(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => fileRef.current.click()}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          +
        </button>

        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/*,video/*"
          onChange={handleFiles}
        />

        <input
          className="flex-1 border rounded-full px-4 py-2"
          placeholder="Message..."
          value={text}
          onChange={handleTyping}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          disabled={!text.trim() && !files.length}
          className="bg-blue-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
