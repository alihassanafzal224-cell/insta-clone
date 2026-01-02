import { useSelector } from "react-redux"
import { logout, logoutUserAsync } from "../store/feauters/authSlice";
import { useDispatch } from "react-redux";

export const Navbar = () => {

    const dispatch = useDispatch();

    const user = useSelector((state) => state.auth.user)
  return (
    <div >
      <header className="bg-white border-b border-gray-300 fixed top-0 w-full z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
          <h1 className="text-2xl font-serif">Instagram</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {user.username || "User"}
            </span>
            <button
              onClick={() => dispatch(logoutUserAsync())}
              className="text-sm font-semibold text-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header></div>
  )
}
