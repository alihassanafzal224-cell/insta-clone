import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard";
import ProfileSkeleton from "../components/ProfileSkeleton";
import { Link } from "react-router-dom";
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

export default function Profile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const loggedInUser = useSelector((state) => state.auth.user);
  const profileUser = useSelector((state) => state.auth.profileUser);
  const profileUserLoading = useSelector((state) => state.auth.profileUserLoading);
  const { userPosts, userPostsLoading } = useSelector((state) => state.post);
  const followersList = useSelector((state) => state.auth.followersList) || [];
  const followingList = useSelector((state) => state.auth.followingList) || [];

  const isOwnProfile = !userId || userId === loggedInUser?._id;
  const user = isOwnProfile ? loggedInUser : profileUser;
  const loggedInId = loggedInUser?._id;
   console.log(user)
  const isFollowing = !isOwnProfile && user?.followers?.includes(loggedInId);

  // Fetch profile and posts when userId or logged-in user changes
  useEffect(() => {
    const idToFetch = isOwnProfile ? loggedInUser?._id : userId;

    if (idToFetch) {
      if (isOwnProfile) {
        console.log("Own profile", isOwnProfile)
        dispatch(fetchUserPosts());
      } else {
        console.log('not own profiles')
        dispatch(fetchUserById(idToFetch));
        dispatch(fetchPostsByUserId(idToFetch));
        dispatch(fetchFollowers(idToFetch));
        dispatch(fetchFollowing(idToFetch));
      }
    }
  }, []);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (isOwnProfile) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You cannot follow yourself!",
      });
      return;
    }
    dispatch(toggleFollow(user._id));
  };

  if (
    userPostsLoading === "loading" ||
    (!isOwnProfile && profileUserLoading === "loading")
  )
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
              alt={`${user?.username || "User"}'s avatar`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Prevent infinite loops by checking if we're already showing default
                if (e.target.src !== window.location.origin + "/default-avatar.png") {
                  e.target.src = "/default-avatar.png";
                }
              }}
            />
          </div>

          <div className="flex-1 flex flex-col justify-center w-full">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-3">
              <h1 className="text-2xl font-bold">{user.username}</h1>

              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  className={`mt-2 md:mt-0 px-4 py-1 border rounded font-semibold text-sm transition
                   ${isFollowing
                      ? "bg-gray-200 hover:bg-gray-300"
                      : "bg-blue-500 text-white hover:bg-blue-600"
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
                onClick={() => setShowFollowersModal(true)}
                className="cursor-pointer font-semibold"
              >
                {user.followers?.length || 0} followers
              </p>

              <p
                onClick={() => setShowFollowingModal(true)}
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

      {/* Posts Grid */}
      <main className="pt-4 max-w-5xl mx-auto w-full flex-1 px-2">
        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {userPosts.map((post) => (
              <PostCard key={post._id} post={post} user={user} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">No posts yet.</p>
        )}
      </main>

      <Footer />

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-4 rounded w-80 max-h-[80vh] overflow-auto">
            <h2 className="font-bold mb-2">Followers</h2>
            {followersList.map((f) => (
              <p key={f._id} className="border-b py-1">
                {f.name}
              </p>
            ))}
            <button
              onClick={() => setShowFollowersModal(false)}
              className="mt-2 px-4 py-1 border rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-4 rounded w-80 max-h-[80vh] overflow-auto">
            <h2 className="font-bold mb-2">Following</h2>
            {followingList.map((f) => (
              <p key={f._id} className="border-b py-1">
                {f.name}
              </p>
            ))}
            <button
              onClick={() => setShowFollowingModal(false)}
              className="mt-2 px-4 py-1 border rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
