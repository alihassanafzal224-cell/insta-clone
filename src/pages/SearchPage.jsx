import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import PostCardSkeleton from "../components/PostCardSkeleton";
import PostCard from "../components/PostCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loggedInUser = useSelector((state) => state.auth.user);
  const { posts, loading: postsLoading } = useSelector((state) => state.post);

  useEffect(() => {
    if (!query.trim()) return setUsers([]);

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:8000/api/users/search?q=${query}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const handleUserClick = (user) => {
    if (user._id === loggedInUser?._id) {
      navigate("/profile");
    } else {
      navigate(`/profile/${user._id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="pt-16 px-4">
        {/* Search Bar */}
        <div className="flex items-center bg-white border rounded-lg px-3 py-2 max-w-sm mx-auto">
          <input
            type="text"
            placeholder="Search for people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        {/* User Search Results (if query is provided) */}
        {query && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800">Users</h2>
            {loading && <p className="text-center text-gray-500">Searching...</p>}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500">
                    <img
                      src={user.avatar || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs mt-2 truncate text-center">{user.username}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display posts if query is empty */}
        {!query && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800">Suggestions</h2>
            {postsLoading === "loading" ? (
              <>
                <PostCardSkeleton/>
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 px-6">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} user={loggedInUser} />
                ))}
              </div>
            )}
            {posts.length === 0 && postsLoading !== "loading" && (
              <p className="text-center text-gray-500 mt-4">No posts available.</p>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
