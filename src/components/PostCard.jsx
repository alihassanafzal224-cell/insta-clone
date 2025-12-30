import { Heart, MessageCircle, Send, Bookmark, X, MoreHorizontal } from "lucide-react"; 
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { likePost, addCommentToPost, deletePost } from "../store/feauters/postSlice";
import Swal from "sweetalert2";

export default function PostCard({ post, user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  /* -------------------- SYNC LIKE STATE -------------------- */
  useEffect(() => {
    setLiked(post.likes?.includes(currentUserId));
    setLikesCount(post.likes?.length || 0);
  }, [post.likes, currentUserId]);

  /* -------------------- CLOSE MENU ON OUTSIDE CLICK -------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  /* -------------------- TOGGLE LIKE -------------------- */
  const toggleLike = () => {
    if (!post._id) return;
    dispatch(likePost(post._id)).then((res) => {
      if (res.payload) {
        setLiked(res.payload.liked);
        setLikesCount(res.payload.likes);
      }
    });
  };

  /* -------------------- ADD COMMENT -------------------- */
  const handleAddComment = () => {
    if (!commentText.trim() || !post._id) return;
    dispatch(addCommentToPost({ postId: post._id, text: commentText }));
    setCommentText("");
  };

  /* -------------------- DELETE POST -------------------- */
  const handleDeletePost = async () => {
    if (!post._id) return;

    const result = await Swal.fire({
      title: "Delete post?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    const res = await dispatch(deletePost(post._id));

    if (deletePost.fulfilled.match(res)) {
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Post deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res.payload || "Failed to delete post",
      });
    }
  };

  /* -------------------- NAVIGATE PROFILE -------------------- */
  const handleUserProfileClick = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  const isVideo = post.image?.match(/\.(mp4|webm|mov|avi)$/i);

  return (
    <div className="bg-white border rounded-md mb-6 shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center cursor-pointer" onClick={() => handleUserProfileClick(user?._id)}>
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <span className="font-semibold text-sm">{user?.name}</span>
        </div>

        {/* Three-dot menu for post owner */}
        {currentUserId === post.user?._id && (
          <div className="relative" ref={menuRef}>
            <MoreHorizontal
              className="w-6 h-6 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
            />
            {showMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-20">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDeletePost();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media */}
      {isVideo ? (
        <video
          src={post.image}
          className="w-full aspect-square object-cover"
          controls
          loop
          muted
          playsInline
        />
      ) : (
        <img src={post.image} alt={post.caption || "Post"} className="w-full aspect-square object-cover" />
      )}

      {/* Actions */}
      <div className="flex justify-between items-center px-3 py-2">
        <div className="flex gap-4">
          <Heart
            onClick={toggleLike}
            className={`w-6 h-6 cursor-pointer ${liked ? "text-red-500 fill-red-500" : ""}`}
          />
          <MessageCircle className="w-6 h-6 cursor-pointer" onClick={() => setShowComments(true)} />
          <Send className="w-6 h-6 cursor-pointer" />
        </div>
        <Bookmark className="w-6 h-6 cursor-pointer" />
      </div>

      {/* Likes */}
      <p className="px-3 font-semibold text-sm">{likesCount} likes</p>

      {/* Caption */}
      <p className="px-3 py-1 text-sm">
        <span className="font-semibold mr-1">{user?.name}</span>
        {post.caption}
      </p>

      {/* Time */}
      <p className="px-3 pb-3 text-xs text-gray-500">
        {new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-60 z-50 flex justify-center items-start pt-20">
          <div className="bg-white w-full max-w-md rounded-md shadow-lg overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <p className="font-semibold">Comments</p>
              <X className="w-5 h-5 cursor-pointer" onClick={() => setShowComments(false)} />
            </div>

            <div className="max-h-80 overflow-y-auto px-4 py-2">
              {post.comments?.length ? (
                post.comments.map((c) => (
                  <div key={c._id} className="flex items-center mb-2">
                    <div
                      className="w-7 h-7 rounded-full overflow-hidden mr-2 cursor-pointer"
                      onClick={() => handleUserProfileClick(c.user?._id)}
                    >
                      <img src={c.user?.avatar || "/default-avatar.png"} alt={c.user?.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm">
                      <span
                        className="font-semibold mr-1 cursor-pointer"
                        onClick={() => handleUserProfileClick(c.user?._id)}
                      >
                        {c.user?.name}
                      </span>
                      {c.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No comments yet</p>
              )}
            </div>

            <div className="flex border-t px-4 py-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border rounded-md px-2 py-1 mr-2"
              />
              <button onClick={handleAddComment} className="text-blue-500 font-semibold">
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
