import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard";
import ProfileSkeleton from "../components/ProfileSkeleton.jsx";
import { fetchUserPosts } from "../store/feauters/postSlice";

export default function Profile() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const { userPosts, userPostsLoading } = useSelector((state) => state.post||{});

  useEffect(() => {
     
      dispatch(fetchUserPosts());
    
  }, [ dispatch]);

  if (!user || userPostsLoading === "loading") return <ProfileSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300 mb-4 md:mb-0">
            <img 
              src={user.username} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
            />
          </div>

          {/* User Info */}
          <div className="flex-1 flex flex-col justify-center w-full">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-3">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <button className="mt-2 md:mt-0 px-4 py-1 border rounded font-semibold text-sm hover:bg-gray-100 transition">
                Edit Profile
              </button>
            </div>

            {/* Stats */}
            <div className="flex space-x-6 text-center md:text-left mb-2">
              <div>
                <p className="font-semibold text-lg">{userPosts.length}</p>
                <p className="text-gray-500 text-sm">posts</p>
              </div>
              <div>
                <p className="font-semibold text-lg">{user.followers || 0}</p>
                <p className="text-gray-500 text-sm">followers</p>
              </div>
              <div>
                <p className="font-semibold text-lg">{user.following || 0}</p>
                <p className="text-gray-500 text-sm">following</p>
              </div>
            </div>

            {/* Bio */}
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
    </div>
  );
}
