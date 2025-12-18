import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import PostCardSkeleton from "../components/PostCardSkeleton";
import PostCard from "../components/PostCard";
import { fetchPosts } from "../store/feauters/postSlice";

export default function HomePage() {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.post);
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="pt-16">
        {/* Stories / Users */}
        <div className="bg-white border-b border-gray-300 py-3 px-4 overflow-x-auto flex space-x-4">
          {posts
            .map((p) => p.user)
            .filter(
              (v, i, a) => a.findIndex((u) => u._id === v._id) === i
            )
            .map((user) => (
              <div
                key={user._id}
                className="flex flex-col items-center cursor-pointer"
              >
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
                <p className="text-xs mt-1 truncate w-16 text-center">
                  {user.username}
                </p>
              </div>
            ))}
        </div>

        {/* Feed */}
        <main className="pt-4 max-w-4xl mx-auto w-full flex-1 px-2">
          {loading === "loading" &&
            Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}

          {posts.length > 0 &&
            posts.map((post) => (
              <PostCard key={post._id} post={post} user={user} />
            ))}

          {loading !== "loading" && posts.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              No posts yet.
            </p>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
