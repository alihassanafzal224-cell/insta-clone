import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket";
import { addMessage } from "../../store/feauters/chatSlice";
import { v4 as uuid } from "uuid";

export default function ChatInput({ conversationId }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);

  /* ---------- FILE PICK ---------- */
  const handleFiles = e => {
    setFiles(Array.from(e.target.files));
  };

  /* ---------- SEND ---------- */
  const sendMessage = async () => {
    if (!text.trim() && files.length === 0) return;

    const tempId = uuid();
    const previews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type
    }));

    /* ---------- OPTIMISTIC MESSAGE ---------- */
    dispatch(
      addMessage({
        conversationId,
        message: {
          _id: tempId,
          conversationId,
          sender: currentUser,
          text,
          media: previews.map(p => p.url),
          uploading: files.length > 0,
          createdAt: new Date(),
          seenBy: [currentUser._id]
        }
      })
    );

    socket.emit("send-message", {
      conversationId,
      text,
      tempId
    });

    setText("");
    setFiles([]);
    fileRef.current.value = "";

    /* ---------- MEDIA UPLOAD ---------- */
    if (files.length > 0) {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("tempId", tempId);

      files.forEach(file => {
        formData.append("media", file);
      });

      await fetch(
        `http://localhost:8000/api/messages/${conversationId}`,
        {
          method: "POST",
          credentials: "include",
          body: formData
        }
      );
    }
  };

  return (
    <div className="border-t p-3 bg-white space-y-2">
      {/* PREVIEW */}
      {files.length > 0 && (
        <div className="flex gap-2">
          {files.map((file, i) => (
            <img
              key={i}
              src={URL.createObjectURL(file)}
              className="w-20 h-20 rounded object-cover"
            />
          ))}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <button onClick={() => fileRef.current.click()}>📎</button>

        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept="image/*,video/*"
          onChange={handleFiles}
        />

        <input
          className="flex-1 border rounded-full px-4 py-2"
          placeholder="Message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="text-blue-500 font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
