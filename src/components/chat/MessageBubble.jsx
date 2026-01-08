import { useSelector } from "react-redux";

export default function MessageBubble({ message, isOwn, isLast }) {
  const currentUser = useSelector(state => state.auth.user);

  const isSeen =
    isOwn &&
    isLast &&
    message.seenBy?.some(
      id => String(id) !== String(currentUser._id)
    );

  return (
    <div className={`mb-2 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-lg max-w-xs overflow-hidden relative ${
          isOwn ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        {/* UPLOADING OVERLAY */}
        {message.uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm z-10">
            Uploading...
          </div>
        )}

        {/* MEDIA */}
        {message.media?.length > 0 && (
          <div className="space-y-1">
            {message.media.map((url, i) =>
              url.match(/video|mp4|webm|mov/) ? (
                <video
                  key={i}
                  src={url}
                  controls
                  className="w-full rounded"
                />
              ) : (
                <img
                  key={i}
                  src={url}
                  className="w-full rounded"
                />
              )
            )}
          </div>
        )}

        {/* TEXT */}
        {message.text && (
          <p className="px-3 py-2">{message.text}</p>
        )}

        {/* META */}
        <div className="flex justify-end gap-2 px-2 pb-1 text-xs opacity-70">
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </span>

          {isOwn && isLast && (
            <span>{isSeen ? "Seen" : "Delivered"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
