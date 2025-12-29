import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import PostCardSkeleton from "../components/PostCardSkeleton";
import PostCard from "../components/PostCard";
import StatusPage from "../components/StatusPage";

import { fetchPosts } from "../store/feauters/postSlice";
import {
  fetchStatusesByUserId,
  fetchAllStatuses,
  createStatus,
  deleteStatus,
} from "../store/feauters/statusSlice";

export default function HomePage() {
  const dispatch = useDispatch();

  const { posts, loading } = useSelector((state) => state.post);
  const { statuses, loading: statusLoading } = useSelector((state) => state.status);
  const user = useSelector((state) => state.auth.user);

  const [statusFile, setStatusFile] = useState(null);
  const [showStatusPage, setShowStatusPage] = useState(false);
  const [clickedUserStatuses, setClickedUserStatuses] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  /* -------------------- FETCH DATA -------------------- */
  useEffect(() => {
    dispatch(fetchPosts());
    if (user?._id) {
      dispatch(fetchStatusesByUserId(user._id));
      dispatch(fetchAllStatuses());
    }
  }, [dispatch, user?._id]);

  /* -------------------- UPLOAD STATUS -------------------- */
  const handleStatusUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);

    await dispatch(createStatus(formData));
    setStatusFile(null);

    dispatch(fetchStatusesByUserId(user._id));
    dispatch(fetchAllStatuses());
  };

  /* -------------------- DELETE STATUS -------------------- */
  const handleDeleteStatus = (statusId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this status!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteStatus(statusId));
        Swal.fire("Deleted!", "Your status has been deleted.", "success");
      }
    });
  };

  /* -------------------- GROUP STATUSES BY USER -------------------- */
  const groupedStatuses = useMemo(() => {
    if (!user?._id) return [];

    const map = {};

    statuses.forEach((status) => {
      const userId = status.user._id;
      if (!map[userId]) map[userId] = [];
      map[userId].push(status);
    });

    // sort each user's statuses (old → new)
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    );

    const followedIds = user.following || [];

    const my = [];
    const followed = [];
    const others = [];

    Object.values(map).forEach((userStatuses) => {
      const ownerId = userStatuses[0].user._id;

      if (ownerId === user._id) my.push(userStatuses);
      else if (followedIds.includes(ownerId)) followed.push(userStatuses);
      else others.push(userStatuses);
    });

    return [...my, ...followed, ...others];
  }, [statuses, user]);

  /* -------------------- VIEW STATUS PAGE -------------------- */
  const handleViewStatusPage = (userStatuses, index = 0) => {
    setClickedUserStatuses(userStatuses);
    setStartIndex(index);
    setShowStatusPage(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="pt-16">
        {/* ==================== STATUS / STORIES ==================== */}
        <div className="bg-white border-b border-gray-300 py-3 px-4 flex items-center space-x-4 overflow-x-auto">
          {/* Add Status */}
          <div className="flex flex-col items-center relative">
            <label className="cursor-pointer flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center text-xl font-bold">
                +
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={(e) => setStatusFile(e.target.files[0])}
              />
            </label>

            {statusFile && (
              <button
                onClick={() => handleStatusUpload(statusFile)}
                className="text-xs mt-1 text-blue-500 font-semibold"
              >
                Upload
              </button>
            )}

            <p className="text-xs mt-1 truncate w-16 text-center">Your Status</p>
          </div>

          {/* Status Avatars */}
          {statusLoading === "loading" ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            groupedStatuses.map((userStatuses) => {
              const firstStatus = userStatuses[0];
              const isOwn = firstStatus.user._id === user._id;

              return (
                <div
                  key={firstStatus.user._id}
                  className="flex flex-col items-center relative cursor-pointer"
                >
                  <div
                    className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500"
                    onClick={() => handleViewStatusPage(userStatuses, 0)}
                  >
                    <img
                      src={firstStatus.user.avatar || "/default-avatar.png"}
                      alt={firstStatus.user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {isOwn && (
                    <button
                      onClick={() => handleDeleteStatus(firstStatus._id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    >
                      ×
                    </button>
                  )}

                  <p className="text-xs mt-1 truncate w-16 text-center">
                    {firstStatus.user.name}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* ==================== FEED ==================== */}
        <main className="pt-4 max-w-xl mx-auto w-full flex-1 px-2">
          {loading === "loading" &&
            Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}

          {posts.length > 0 &&
            posts.map((post) => (
              <PostCard key={post._id} post={post} user={post.user} />
            ))}

          {loading !== "loading" && posts.length === 0 && (
            <p className="text-center text-gray-500 mt-6">No posts yet.</p>
          )}
        </main>
      </div>

      <div className="h-15">
        <Footer />
      </div>

      {/* ==================== STATUS PAGE ==================== */}
      {showStatusPage && (
        <StatusPage
          userStatuses={clickedUserStatuses}
          startIndex={startIndex}
          onClose={() => setShowStatusPage(false)}
        />
      )}
    </div>
  );
}
