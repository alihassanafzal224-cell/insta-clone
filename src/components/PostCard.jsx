import { Heart, MessageCircle, Send, Bookmark, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { likePost, addCommentToPost } from "../store/feauters/postSlice";

export default function PostCard({ post, user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const userId = user?._id;
    setLiked(post.likes?.includes(userId));
    setLikesCount(post.likes?.length || 0);
  }, [post.likes, user?._id]);

  const toggleLike = () => {
    dispatch(likePost(post._id)).then((res) => {
      if (res.payload) {
        setLiked(res.payload.liked);
        setLikesCount(res.payload.likes);
      }
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    dispatch(addCommentToPost({ postId: post._id, text: commentText }));
    setCommentText("");
  };

  const handleUserProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const isVideo = post.image?.match(/\.(mp4|webm|mov|avi)$/i);

  return (
    <div className="bg-white rounded-md shadow mb-6 overflow-hidden border">
      {/* Header */}
      <div className="flex items-center p-3">
        <div
          className="w-10 h-10 rounded-full overflow-hidden mr-3 cursor-pointer"
          onClick={() => handleUserProfileClick(user._id)}
        >
          <img
            src={user?.avatar || "https://i.pravatar.cc/150?img=3"}
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <p
          className="font-semibold text-sm cursor-pointer"
          onClick={() => handleUserProfileClick(user._id)}
        >
          {user?.name}
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
            className={`w-6 h-6 cursor-pointer ${liked ? "text-red-500" : ""}`}
            onClick={toggleLike}
          />
          <MessageCircle
            className="w-6 h-6 cursor-pointer"
            onClick={() => setShowComments(!showComments)}
          />
          <Send className="w-6 h-6 cursor-pointer" />
        </div>
        <Bookmark className="w-6 h-6 cursor-pointer" />
      </div>

      {/* Likes */}
      <div className="px-3">
        <p className="font-semibold text-sm">{likesCount} likes</p>
      </div>

      {/* Caption */}
      <div className="px-3 py-2">
        <p className="text-sm">
          <span className="font-semibold mr-1">{user?.name}</span>
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

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 z-50 bg-gray-300 bg-opacity-60 flex justify-center items-start pt-20">
          <div className="bg-white w-full max-w-md rounded-md shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <p className="font-semibold">Comments</p>
              <X
                className="w-5 h-5 cursor-pointer"
                onClick={() => setShowComments(false)}
              />
            </div>

            {/* Comments List */}
            <div className="max-h-80 overflow-y-auto px-4 py-2">
              {post.comments?.length ? (
                post.comments.map((c) => (
                  <p key={c._id} className="text-sm mb-1">
                    <span className="font-semibold mr-1">{c.user.name}</span>
                    {c.text}
                  </p>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No comments yet</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="flex border-t px-4 py-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border rounded-md px-2 py-1 mr-2"
              />
              <button
                onClick={handleAddComment}
                className="text-blue-500 font-semibold"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
