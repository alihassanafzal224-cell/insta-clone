import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket";
import { addMessage, replaceMessage, removeTempMessage } from "../../store/feauters/chatSlice";
import { sendMessageWithMedia } from "../../store/feauters/chatSlice";
import { v4 as uuid } from "uuid";
import { X, Play, Video, Image } from "lucide-react";

export default function ChatInput({ conversationId }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const fileRef = useRef(null);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      filePreviews.forEach(preview => {
        if (preview.url && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [filePreviews]);

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Create previews for each file
    const newPreviews = selectedFiles.map(file => {
      const previewUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      
      return {
        file,
        url: previewUrl,
        type: file.type,
        isVideo,
        name: file.name,
        size: file.size
      };
    });

    setFiles(prev => [...prev, ...selectedFiles]);
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleTyping = (e) => {
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

  const clearInput = () => {
    setText("");
    
    // Cleanup preview URLs
    filePreviews.forEach(preview => {
      if (preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    });
    
    setFiles([]);
    setFilePreviews([]);
    
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const removeFile = (index) => {
    // Cleanup the specific preview URL
    if (filePreviews[index].url && filePreviews[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviews[index].url);
    }
    
    const newFiles = [...files];
    const newPreviews = [...filePreviews];
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const sendMessage = async () => {
    if (!text.trim() && files.length === 0) return;

    const tempId = uuid();

    if (isTypingRef.current) {
      socket.emit("stop-typing", { conversationId });
      isTypingRef.current = false;
    }

    // Create optimistic message
    const optimisticMessage = {
      _id: tempId,
      tempId: tempId,
      conversationId,
      sender: currentUser,
      text,
      media: filePreviews.map(preview => ({ 
        url: preview.url, 
        type: preview.type,
        isVideo: preview.isVideo,
        uploading: true,
        name: preview.name
      })),
      uploading: files.length > 0,
      createdAt: new Date().toISOString(),
      seenBy: [currentUser._id]
    };

    // Add optimistic message
    dispatch(addMessage({
      conversationId,
      message: optimisticMessage
    }));

    try {
      // Send via HTTP with Redux thunk
      dispatch(sendMessageWithMedia({
        conversationId,
        text,
        files,
        tempId
      })).unwrap()
        .then(realMessage => {
          // Replace optimistic message with real one
          dispatch(replaceMessage({
            conversationId,
            tempId,
            message: realMessage
          }));
        })
        .catch(error => {
          console.error("Failed to send message:", error);
          // Remove failed optimistic message
          dispatch(removeTempMessage({
            conversationId,
            tempId
          }));
        });

      clearInput();
    } catch (err) {
      console.error("Error sending message:", err);
      dispatch(removeTempMessage({
        conversationId,
        tempId
      }));
      clearInput();
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get video duration for preview
  const getVideoDuration = (preview, index) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const duration = video.duration;
      const formattedDuration = new Date(duration * 1000).toISOString().substr(11, 8);
      
      // Update preview with duration
      setFilePreviews(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          duration: formattedDuration
        };
        return updated;
      });
      
      URL.revokeObjectURL(preview.url);
    };
    
    video.src = preview.url;
  };

  // Get video duration when video files are added
  useEffect(() => {
    filePreviews.forEach((preview, index) => {
      if (preview.isVideo && !preview.duration) {
        getVideoDuration(preview, index);
      }
    });
  }, [filePreviews]);

  return (
    <div className="border-t p-4 bg-white space-y-3">
      {/* FILE PREVIEWS */}
      {filePreviews.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {filePreviews.map((preview, index) => (
            <div 
              key={index} 
              className="relative group shrink-0 w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
            >
              {/* VIDEO PREVIEW */}
              {preview.isVideo ? (
                <div className="relative w-full h-full">
                  <video
                    src={preview.url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                  />
                  
                  {/* Video overlay with play button and duration */}
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mb-2">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </div>
                    {preview.duration && (
                      <div className="bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {preview.duration}
                      </div>
                    )}
                  </div>
                  
                  {/* Video info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-2">
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Video className="w-3 h-3" />
                      <span className="truncate">{preview.name}</span>
                    </div>
                    <div className="text-white/80 text-xs">
                      {formatFileSize(preview.size)}
                    </div>
                  </div>
                </div>
              ) : (
                /* IMAGE PREVIEW */
                <div className="relative w-full h-full">
                  <img
                    src={preview.url}
                    className="w-full h-full object-cover"
                    alt={preview.name}
                  />
                  
                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <div className="flex items-center gap-1 text-white text-xs">
                        <Image className="w-3 h-3" />
                        <span className="truncate">{preview.name}</span>
                      </div>
                      <div className="text-white/80 text-xs">
                        {formatFileSize(preview.size)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* REMOVE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* INPUT AREA */}
      <div className="flex items-center gap-2">
        {/* ATTACHMENT BUTTON */}
        <div className="relative">
          <button
            onClick={() => fileRef.current.click()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group relative"
            title="Attach files"
          >
            <div className="text-gray-600 group-hover:text-blue-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </div>
          </button>
          
          {/* TOOLTIP */}
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Add photos/videos
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept="image/*,video/*"
          onChange={handleFiles}
        />

        {/* TEXT INPUT */}
        <div className="flex-1 relative">
          <input
            className="w-full border border-gray-300 rounded-full px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Message..."
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          
          {/* CHARACTER COUNT (optional) */}
          {text.length > 0 && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {text.length}/1000
            </div>
          )}
        </div>

        {/* SEND BUTTON */}
        <button
          onClick={sendMessage}
          disabled={!text.trim() && files.length === 0}
          className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center min-w-11 ${
            !text.trim() && files.length === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-md hover:shadow-lg"
          }`}
        >
          {!text.trim() && files.length === 0 ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* FILE TYPE HINT */}
      {filePreviews.length === 0 && (
        <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
          <span className="flex items-center gap-1">
            <Image className="w-3 h-3" />
            Photos
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Video className="w-3 h-3" />
            Videos (up to 50MB)
          </span>
        </div>
      )}
    </div>
  );
}