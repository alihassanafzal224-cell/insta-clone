import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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

  const loggedInUser = useSelector((state) => state.auth.user);
  const profileUser = useSelector((state) => state.auth.profileUser);
  const profileUserLoading = useSelector((state) => state.auth.profileUserLoading);
  const { userPosts, userPostsLoading } = useSelector((state) => state.post);
  const { statuses, loading: statusLoading } = useSelector((state) => state.status);
  const followersList = useSelector((state) => state.auth.followersList) || [];
  const followingList = useSelector((state) => state.auth.followingList) || [];

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [statusFile, setStatusFile] = useState(null);
  const [showStatusPage, setShowStatusPage] = useState(false);
  const [clickedUserStatuses, setClickedUserStatuses] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  const isOwnProfile = !userId || userId === loggedInUser?._id;
  const user = isOwnProfile ? loggedInUser : profileUser;
  const loggedInId = loggedInUser?._id;
  const isFollowing = !isOwnProfile && user?.followers?.includes(loggedInId);

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

  /* -------------------- FOLLOW -------------------- */
  const handleFollow = () => {
    if (isOwnProfile) {
      Swal.fire({ icon: "error", title: "Oops...", text: "You cannot follow yourself!" });
      return;
    }
    dispatch(toggleFollow(user._id));
  };

  /* -------------------- UPLOAD STATUS -------------------- */
  const handleStatusUpload = async () => {
    if (!statusFile) return;

    const formData = new FormData();
    formData.append("media", statusFile);

    await dispatch(createStatus(formData));
    setStatusFile(null);
    dispatch(fetchStatusesByUserId(loggedInUser._id)); // refresh after upload
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

  /* -------------------- VIEW STATUS PAGE -------------------- */
  const handleViewStatusPage = (status) => {
    const userStatuses = statuses.filter((s) => s.user && s.user._id === status.user._id);
    const index = userStatuses.findIndex((s) => s._id === status._id);
    setClickedUserStatuses(userStatuses);
    setStartIndex(index);
    setShowStatusPage(true);
  };

  /* -------------------- FILTERED STATUSES -------------------- */
  const profileStatuses = useMemo(
    () => statuses.filter((s) => s.user && s.user._id === user?._id),
    [statuses, user]
  );

  if (userPostsLoading === "loading" || (!isOwnProfile && profileUserLoading === "loading"))
    return <ProfileSkeleton />;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300 mb-4 md:mb-0">
            <img
              src={user?.avatar || "/default-avatar.png"}
              alt={user?.username || "User"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center w-full">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-3">
              <h1 className="text-2xl font-bold">{user.username}</h1>

              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  className={`mt-2 md:mt-0 px-4 py-1 border rounded font-semibold text-sm transition ${
                    isFollowing ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}

              {isOwnProfile && (
                <Link to="/edit-profile">
                  <button className="px-4 py-1 border rounded">Edit Profile</button>
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
                className="cursor-pointer font-semibold"
              >
                {user.followers?.length || 0} followers
              </p>

              <p
                onClick={() => {
                  dispatch(fetchFollowing(user._id));
                  setShowFollowingModal(true);
                }}
                className="cursor-pointer font-semibold"
              >
                {user.following?.length || 0} following
              </p>
            </div>

            <div className="text-sm text-gray-700">
              <p className="font-semibold">{user.name || user.username}</p>
              <p>{user.bio || "No bio yet."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statuses */}
      {isOwnProfile && (
        <div className="bg-white border-b border-gray-300 py-3 px-4 flex items-center space-x-4 overflow-x-auto">
          {/* Add Status */}
          <div className="flex flex-col items-center relative">
            <label className="cursor-pointer flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center text-xl font-bold">
                +
              </div>
              <input type="file" hidden onChange={(e) => setStatusFile(e.target.files[0])} />
            </label>

            {statusFile && (
              <button onClick={handleStatusUpload} className="text-xs mt-1 text-blue-500 font-semibold">
                Upload
              </button>
            )}

            <p className="text-xs mt-1 truncate w-16 text-center">Your Status</p>
          </div>

          {statusLoading === "loading" ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            profileStatuses.map((status) => (
              <div key={status._id} className="flex flex-col items-center relative cursor-pointer">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500"
                  onClick={() => handleViewStatusPage(status)}
                >
                  <img
                    src={status.user?.avatar || "/default-avatar.png"}
                    alt={status.user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {status.user?._id === loggedInUser._id && (
                  <button
                    onClick={() => handleDeleteStatus(status._id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    ×
                  </button>
                )}

                <p className="text-xs mt-1 truncate w-16 text-center">{status.user?.name || "User"}</p>
              </div>
            ))
          )}
        </div>
      )}

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
