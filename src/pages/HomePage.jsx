import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import PostCardSkeleton from "../components/PostCardSkeleton";
import PostCard from "../components/PostCard";
import StatusPage from "../components/StatusPage";
import MyStatusBubble from "../components/MyStatusBubble";
import { socket } from "../socket";
import { fetchPosts } from "../store/feauters/postSlice";
import {
  fetchStatusesByUserId,
  fetchAllStatuses,
  createStatus,
  deleteStatus,
} from "../store/feauters/statusSlice";
import { logoutUserAsync } from "../store/feauters/authSlice";

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { posts, loading } = useSelector((state) => state.post);
  const { statuses, loading: statusLoading } = useSelector(
    (state) => state.status
  );
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

    try {
      await dispatch(createStatus(formData)).unwrap();
      dispatch(fetchStatusesByUserId(user._id));
      dispatch(fetchAllStatuses());
    } catch (error) {
      Swal.fire("Error", "Failed to upload status", "error");
    }
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
    const validStatuses = statuses.filter((status) => status.user);

    validStatuses.forEach((status) => {
      const userId = status.user._id;
      if (!map[userId]) map[userId] = [];
      map[userId].push(status);
    });

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

  /* -------------------- GET MY STATUSES -------------------- */
  const myStatuses = useMemo(() => {
    return groupedStatuses.find((s) => s[0]?.user._id === user?._id) || [];
  }, [groupedStatuses, user]);

  /* -------------------- VIEW STATUS PAGE -------------------- */
  const handleViewStatusPage = (userStatuses, index = 0) => {
    setClickedUserStatuses(userStatuses);
    setStartIndex(index);
    setShowStatusPage(true);
  };

  /* -------------------- LOGOUT -------------------- */
  const handleLogout = async () => {
    try {
      socket.disconnect();
      await dispatch(logoutUserAsync()).unwrap();
      Swal.fire("Logged out", "You have been logged out successfully.", "success");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      Swal.fire("Error", "Logout failed. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar handleLogout={handleLogout} />

      <div className="pt-16">
        {/* ==================== STATUS / STORIES ==================== */}
        <div className="bg-white border-b border-gray-300 py-3 px-4 flex items-center space-x-4 overflow-x-auto">
          {/* My Status Bubble */}
          <MyStatusBubble
            user={user}
            myStatuses={myStatuses}
            onAdd={(file) => handleStatusUpload(file)}
            onView={() => handleViewStatusPage(myStatuses, 0)}
          />

          {/* Other Users' Statuses */}
          {statusLoading === "loading" ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            groupedStatuses
              .filter((userStatuses) => userStatuses[0]?.user._id !== user?._id)
              .map((userStatuses) => {
                const firstStatus = userStatuses[0];
                if (!firstStatus) return null;

                return (
                  <div
                    key={firstStatus.user._id}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleViewStatusPage(userStatuses, 0)}
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500">
                      <img
                        src={firstStatus.user.avatar || "/default-avatar.png"}
                        alt={firstStatus.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
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
          showDeleteButton={clickedUserStatuses[0]?.user?._id === user?._id}
          onDeleteStatus={handleDeleteStatus}
        />
      )}
    </div>
  );
}