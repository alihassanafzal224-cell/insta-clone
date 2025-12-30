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
    dispatch(likePost(post._id)).then((res) => {
      if (res.payload) {
        setLiked(res.payload.liked);
        setLikesCount(res.payload.likes);
      }
    });
  };

  /* -------------------- ADD COMMENT -------------------- */
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    dispatch(addCommentToPost({ postId: post._id, text: commentText }));
    setCommentText("");
  };

  /* -------------------- DELETE POST -------------------- */
  const handleDeletePost = async () => {
    setShowMenu(false);

    const result = await Swal.fire({
      title: "Delete post?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    const res = await dispatch(deletePost(post._id));

    if (deletePost.fulfilled.match(res)) {
      Swal.fire({
        icon: "success",
        title: "Post deleted",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  const handleProfileClick = (id) => navigate(`/profile/${id}`);
  const isVideo = post.image?.match(/\.(mp4|webm|mov|avi)$/i);

  return (
    <div className="bg-white border rounded-md mb-6 shadow">
      {/* HEADER */}
      <div className="flex items-center justify-between p-3">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => handleProfileClick(user?._id)}
        >
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <span className="font-semibold text-sm">{user?.name}</span>
        </div>

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
                  onClick={handleDeletePost}
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

      {/* MEDIA */}
      {isVideo ? (
        <video src={post.image} controls className="w-full aspect-square object-cover" />
      ) : (
        <img src={post.image} alt="post" className="w-full aspect-square object-cover" />
      )}

      {/* ACTIONS */}
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

      {/* LIKES */}
      <p className="px-3 font-semibold text-sm">{likesCount} likes</p>

      {/* CAPTION */}
      <p className="px-3 py-1 text-sm">
        <span className="font-semibold mr-1">{user?.name}</span>
        {post.caption}
      </p>

      {/* COMMENTS MODAL */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
          <div className="bg-white w-full max-w-md rounded-md">
            <div className="flex justify-between p-3 border-b">
              <span className="font-semibold">Comments</span>
              <X className="cursor-pointer" onClick={() => setShowComments(false)} />
            </div>

            <div className="max-h-80 overflow-y-auto p-3">
              {post.comments?.length ? (
                post.comments.map((c) => (
                  <p key={c._id} className="text-sm mb-2">
                    <span className="font-semibold mr-1">{c.user?.name}</span>
                    {c.text}
                  </p>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No comments yet</p>
              )}
            </div>

            <div className="flex border-t p-3">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border rounded px-2 py-1"
              />
              <button onClick={handleAddComment} className="ml-2 text-blue-500 font-semibold">
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
