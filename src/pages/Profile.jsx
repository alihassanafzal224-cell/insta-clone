import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createConversation } from "../store/feauters/chatSlice";
import Swal from "sweetalert2";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard";
import StatusPage from "../components/StatusPage";
import FollowModel from "../components/FollowModel";
import ProfileSkeleton from "../components/ProfileSkeleton";
import {
  fetchUserPosts,
  fetchPostsByUserId,
} from "../store/feauters/postSlice";
import {
  fetchUserById,
  toggleFollow,
  fetchFollowers,
  fetchFollowing,
} from "../store/feauters/authSlice";
import {
  fetchStatusesByUserId,
  createStatus,
  deleteStatus,
} from "../store/feauters/statusSlice";

export default function Profile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const loggedInUser = useSelector((state) => state.auth.user);
  const profileUser = useSelector((state) => state.auth.profileUser);
  const profileUserLoading = useSelector((state) => state.auth.profileUserLoading);
  const { userPosts, userPostsLoading } = useSelector((state) => state.post);
  const { statuses, loading: statusLoading } = useSelector((state) => state.status);
  const followersList = useSelector((state) => state.auth.followersList) || [];
  const followingList = useSelector((state) => state.auth.followingList) || [];

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showStatusPage, setShowStatusPage] = useState(false);
  const [clickedUserStatuses, setClickedUserStatuses] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  const isOwnProfile = !userId || userId === loggedInUser?._id;
  const user = isOwnProfile ? loggedInUser : profileUser;
  const loggedInId = loggedInUser?._id;
  const isFollowing =
    !isOwnProfile &&
    user?.followers?.some(
      (f) => (typeof f === "string" ? f : f._id) === loggedInId
    );

  /* -------------------- FETCH DATA -------------------- */
  useEffect(() => {
    const idToFetch = isOwnProfile ? loggedInUser?._id : userId;
    if (!idToFetch) return;

    if (isOwnProfile) {
      dispatch(fetchUserPosts());
      dispatch(fetchStatusesByUserId(idToFetch));
    } else {
      dispatch(fetchUserById(idToFetch));
      dispatch(fetchPostsByUserId(idToFetch));
      dispatch(fetchStatusesByUserId(idToFetch));
    }
  }, [dispatch, userId, loggedInUser?._id]);

  /* -------------------- STATUSES -------------------- */
  const myStatuses = useMemo(() => {
    if (!user?._id) return [];

    const my = statuses
      .filter((status) => status.user && status.user._id === user._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return my;
  }, [statuses, user]);

  const hasActiveStatus = useMemo(() => {
    // Status is active if created within last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return myStatuses.some(status => new Date(status.createdAt) > twentyFourHoursAgo);
  }, [myStatuses]);

  /* -------------------- HANDLERS -------------------- */
  const handleFollow = () => {
    if (isOwnProfile) {
      Swal.fire({ icon: "error", title: "Oops...", text: "You cannot follow yourself!" });
      return;
    }
    dispatch(toggleFollow(user._id));
  };

  const handleStatusUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("media", file);

    try {
      await dispatch(createStatus(formData)).unwrap();
      dispatch(fetchStatusesByUserId(loggedInUser._id));
      Swal.fire("Success", "Status uploaded successfully", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to upload status", "error");
    }
  };

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

  const handleAddStatusClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleStatusUpload(file);
    }
    e.target.value = null; // Reset input
  };

  const handleAvatarClick = () => {
    if (myStatuses.length > 0 && hasActiveStatus) {
      handleViewStatusPage(myStatuses, 0);
    }
  };

  const handleViewStatusPage = (statusesToView, index = 0) => {
    setClickedUserStatuses(statusesToView);
    setStartIndex(index);
    setShowStatusPage(true);
  };

  const handleAddHighlight = () => {
    console.log("Add highlight clicked");
    // You can add highlight upload logic here
  };

  const handleMessage = async () => {
    try {
      const res = await dispatch(createConversation(user._id)).unwrap();
      navigate(`/messages/${res._id}`);
    } catch (err) {
      Swal.fire("Error", err, "error");
    }
  };

  if (userPostsLoading === "loading" || (!isOwnProfile && profileUserLoading === "loading"))
    return <ProfileSkeleton />;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          {/* Avatar with Status Indicator */}
          <div className="relative w-28 h-28 mb-4 md:mb-0">
            <div
              className={`w-full h-full rounded-full border-2 ${hasActiveStatus ? 'border-blue-500' : 'border-gray-300'} overflow-hidden cursor-pointer`}
              onClick={handleAvatarClick}
            >
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt={user?.username || "User"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Status ring if user has active statuses */}
            {hasActiveStatus && (
              <span className="absolute inset-0 rounded-full border-4 border-blue-500 animate-pulse pointer-events-none"></span>
            )}

            {/* Add Status button (only for own profile) */}
            {isOwnProfile && (
              <>
                <button
                  onClick={handleAddStatusClick}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-600 shadow-md transition-transform hover:scale-110"
                  title="Add to story"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 flex flex-col justify-center w-full">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-3">
              <h1 className="text-2xl font-bold">{user.username}</h1>

              {!isOwnProfile && (
                <>
                  <button
                    onClick={handleFollow}
                    className={`mt-2 md:mt-0 px-4 py-1 border rounded font-semibold text-sm transition ${isFollowing ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>

                  <button
                    onClick={handleMessage}
                    className="mt-2 md:mt-0 px-4 py-1 border rounded font-semibold text-sm bg-green-500 text-white hover:bg-green-600"
                  >
                    Message
                  </button>
                </>
              )}

              {isOwnProfile && (
                <Link to="/edit-profile">
                  <button className="mt-2 md:mt-0 px-4 py-1 border rounded hover:bg-gray-50 transition">
                    Edit Profile
                  </button>
                </Link>
              )}
            </div>

            <div className="flex space-x-6 text-center md:text-left mb-2">
              <div>
                <p className="font-semibold text-lg">{userPosts.length}</p>
                <p className="text-gray-500 text-sm">posts</p>
              </div>

              <p
                onClick={() => {
                  dispatch(fetchFollowers(user._id));
                  setShowFollowersModal(true);
                }}
                className="cursor-pointer hover:text-blue-500 transition"
              >
                <span className="font-semibold text-lg">{user.followers?.length || 0}</span>
                <span className="text-gray-500 text-sm ml-1">followers</span>
              </p>

              <p
                onClick={() => {
                  dispatch(fetchFollowing(user._id));
                  setShowFollowingModal(true);
                }}
                className="cursor-pointer hover:text-blue-500 transition"
              >
                <span className="font-semibold text-lg">{user.following?.length || 0}</span>
                <span className="text-gray-500 text-sm ml-1">following</span>
              </p>
            </div>

            <div className="text-sm text-gray-700">
              <p className="font-semibold">Bio</p>
              <p>{user.bio || "No bio yet."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SIMPLE HIGHLIGHTS SECTION ==================== */}
      <div className="bg-white border-b border-gray-300 py-3 px-4">
        <div className="flex items-center space-x-4 overflow-x-auto">
          {/* Simple + icon for highlights */}
          {isOwnProfile && (
            <div className="shrink-0 flex flex-col items-center cursor-pointer" onClick={handleAddHighlight}>
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:scale-105 hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs mt-1 text-gray-600 hover:text-blue-600">Highlight</span>
            </div>
          )}

          {/* Existing highlights (if any) */}
          {/* {myStatuses.length > 0 && myStatuses.map((status, index) => (
            <div
              key={status._id}
              className="shrink-0 flex flex-col items-center cursor-pointer"
              onClick={() => handleViewStatusPage(myStatuses, index)}
            >
              <div className="w-16 h-16 rounded-full border-2 border-gray-300 overflow-hidden hover:border-blue-300 transition-all duration-200 hover:scale-105">
                {status.mediaType?.startsWith("video") ? (
                  <video
                    src={status.mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={status.mediaUrl}
                    alt="highlight"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <span className="text-xs mt-1 text-gray-600 truncate max-w-16">
                {status.title || `Highlight ${index + 1}`}
              </span>
            </div>
          ))} */}
        </div>
      </div>

      {/* Posts Grid */}
      <main className="pt-4 max-w-5xl mx-auto w-full flex-1 px-2">
        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {userPosts.map((post) => <PostCard key={post._id} post={post} user={post.user} />)}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">No posts yet.</p>
        )}
      </main>

      <div className="h-15">
        <Footer />
      </div>

      {/* StatusPage Preview */}
      {showStatusPage && (
        <StatusPage
          userStatuses={clickedUserStatuses}
          startIndex={startIndex}
          onClose={() => setShowStatusPage(false)}
          showDeleteButton={clickedUserStatuses[0]?.user?._id === loggedInUser?._id}
          onDeleteStatus={handleDeleteStatus}
        />
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <FollowModel
          title="Followers"
          users={followersList}
          onClose={() => setShowFollowersModal(false)}
        />
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <FollowModel
          title="Following"
          users={followingList}
          onClose={() => setShowFollowingModal(false)}
        />
      )}
    </div>
  );
}