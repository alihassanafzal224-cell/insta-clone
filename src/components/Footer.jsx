import { Home, PlusSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Footer(){
  const navigate = useNavigate();

  return (
    <footer className="fixed bottom-0 w-full bg-white border-t border-gray-300">
      <div className="max-w-xl mx-auto flex justify-around items-center h-14">
        
        <button
          className="cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Home />
        </button>

        <button
          className="cursor-pointer"
          onClick={() => navigate("/post")}
        >
          <PlusSquare />
        </button>

        <button
          className="cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <User />
        </button>

      </div>
    </footer>
  );
};
