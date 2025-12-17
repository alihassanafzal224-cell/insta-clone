import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { useState } from "react";

export default function PostCard({ post, user }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(
    Math.floor(Math.random() * 100) + 1
  );

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  // Detect video by extension
  const isVideo = post.image?.match(/\.(mp4|webm|mov|avi)$/i);

  return (
    <div className="bg-white rounded-md shadow mb-6 overflow-hidden border">
      {/* Header */}
      <div className="flex items-center p-3">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          <img
            src={user?.avatar || "https://i.pravatar.cc/150?img=3"}
            alt={user?.username}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="font-semibold text-sm">
          {user?.username}
        </p>
      </div>

      {/* Media */}
      <div className="w-full bg-gray-100">
        {isVideo ? (
          <video
            src={post.image}
            className="w-full aspect-square object-cover"
            controls
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={post.image}
            alt={post.caption}
            className="w-full aspect-square object-cover"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center px-3 py-2">
        <div className="flex space-x-4">
          <Heart
            className={`w-6 h-6 cursor-pointer ${
              liked ? "text-red-500" : ""
            }`}
            onClick={toggleLike}
          />
          <MessageCircle className="w-6 h-6 cursor-pointer" />
          <Send className="w-6 h-6 cursor-pointer" />
        </div>
        <Bookmark className="w-6 h-6 cursor-pointer" />
      </div>

      {/* Likes */}
      <div className="px-3">
        <p className="font-semibold text-sm">{likes} likes</p>
      </div>

      {/* Caption */}
      <div className="px-3 py-2">
        <p className="text-sm">
          <span className="font-semibold mr-1">
            {user?.username}
          </span>
          {post.caption}
        </p>
      </div>

      {/* Time */}
      <div className="px-3 pb-3">
        <p className="text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
