import { Home, PlusSquare, User, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUser = useSelector((state) => state.auth.user);

  const isActive = (path) => location.pathname.startsWith(path) ? "text-black" : "text-gray-500";

  const handleProfileClick = () => {
    if (loggedInUser?._id) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <footer className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-300 z-50">
      <div className="max-w-full mx-auto flex justify-around items-center h-14 px-4">
        <button onClick={() => navigate("/")} className={`cursor-pointer ${isActive("/")}`}>
          <Home />
        </button>

        <button onClick={() => navigate("/search")} className={`cursor-pointer ${isActive("/search")}`}>
          <Search />
        </button>

        <button onClick={() => navigate("/post")} className={`cursor-pointer ${isActive("/post")}`}>
          <PlusSquare />
        </button>

        <button onClick={handleProfileClick} className={`cursor-pointer ${isActive("/profile")}`}>
          <User />
        </button>
      </div>
    </footer>
  );
}
