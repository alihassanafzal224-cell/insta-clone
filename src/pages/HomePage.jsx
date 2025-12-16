import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, MessageCircle, Send, Bookmark, Home, PlusSquare, User } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function HomePage() {
  
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [posts] = useState([
    {
      id: 1,
      username: "john_doe",
      image: "https://picsum.photos/600/600?random=1",
      caption: "Enjoying the view 🌅",
    },
    {
      id: 2,
      username: "jane_smith",
      image: "https://picsum.photos/600/600?random=2",
      caption: "Weekend vibes ✨",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar/>
      {/* Feed */}
      <main className="pt-20 max-w-xl mx-auto">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-gray-300 mb-6 rounded-sm"
          >
            {/* Post Header */}
            <div className="flex items-center px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
              <p className="text-sm font-semibold">{post.username}</p>
            </div>

            {/* Post Image */}
            <img
              src={post.image}
              alt="post"
              className="w-full object-cover"
            />

            {/* Post Actions */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex gap-4">
                <Heart className="cursor-pointer" />
                <MessageCircle className="cursor-pointer" />
                <Send className="cursor-pointer" />
              </div>
              <Bookmark className="cursor-pointer" />
            </div>

            {/* Caption */}
            <div className="px-4 pb-4 text-sm">
              <span className="font-semibold mr-2">
                {post.username}
              </span>
              {post.caption}
            </div>
          </div>
        ))}
      </main>
      <Footer/>
    </div>
     );
}
