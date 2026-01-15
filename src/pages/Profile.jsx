import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createConversation } from "../store/feauters/chatSlice";
import Swal from "sweetalert2";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard";
import StatusPage from "../components/StatusPage";
import FollowModel from "../components/FollowModel";
import ProfileSkeleton from "../components/ProfileSkeleton";
import MyStatusBubble from "../components/MyStatusBubble";
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
  deleteStatus, // ADD THIS IMPORT
} from "../store/feauters/statusSlice";

export default function Profile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  /* -------------------- FOLLOW -------------------- */
  const handleFollow = () => {
    if (isOwnProfile) {
      Swal.fire({ icon: "error", title: "Oops...", text: "You cannot follow yourself!" });
      return;
    }
    dispatch(toggleFollow(user._id));
  };

  /* -------------------- UPLOAD STATUS -------------------- */
  const handleStatusUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("media", file);

    try {
      await dispatch(createStatus(formData)).unwrap();
      dispatch(fetchStatusesByUserId(loggedInUser._id));
    } catch (error) {
      Swal.fire("Error", "Failed to upload status", "error");
    }
  };

  /* -------------------- DELETE STATUS -------------------- */ // ADD THIS FUNCTION
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

  /* -------------------- GROUP MY STATUSES (HOME-PAGE STYLE) -------------------- */
  const myStatuses = useMemo(() => {
    if (!user?._id) return [];

    const my = statuses
      .filter((status) => status.user && status.user._id === user._id)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return my;
  }, [statuses, user]);

  /* -------------------- VIEW STATUS PAGE -------------------- */
  const handleViewStatusPage = (statusesToView, index = 0) => {
    setClickedUserStatuses(statusesToView);
    setStartIndex(index);
    setShowStatusPage(true);
  };

  /* -------------------- Messages -------------------- */
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
                  className={`mt-2 md:mt-0 px-4 py-1 border rounded font-semibold text-sm transition ${isFollowing ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
              {!isOwnProfile && (
                <button
                  onClick={handleMessage}
                  className="mt-2 md:mt-0 px-4 py-1 border rounded font-semibold text-sm bg-green-500 text-white hover:bg-green-600"
                >
                  Message
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
              <p className="font-semibold">Bio</p>
              <p>{user.bio || "No bio yet."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== STATUS / STORIES ==================== */}
      {isOwnProfile && (
        <div className="bg-white border-b border-gray-300 py-3 px-4 flex items-center space-x-4 overflow-x-auto">
          <MyStatusBubble
            user={loggedInUser}
            myStatuses={myStatuses}
            onAdd={(file) => handleStatusUpload(file)}
            onView={() => handleViewStatusPage(myStatuses, 0)}
          />

          {statusLoading === "loading" && (
            <p className="text-sm text-gray-500">Loading...</p>
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

      {/* StatusPage Preview - UPDATED WITH DELETE PROPS */}
      {showStatusPage && (
        <StatusPage
          userStatuses={clickedUserStatuses}
          startIndex={startIndex}
          onClose={() => setShowStatusPage(false)}
          showDeleteButton={clickedUserStatuses[0]?.user?._id === loggedInUser?._id} // ADD THIS
          onDeleteStatus={handleDeleteStatus} // ADD THIS
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