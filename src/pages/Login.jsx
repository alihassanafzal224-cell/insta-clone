import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/feauters/authSlice";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const { loading, error } = useSelector((state) => state.auth);

  const query = new URLSearchParams(location.search);
  const emailVerified = query.get("verified") === "true";

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-87.5">
        <div className="bg-white border border-gray-300 px-10 py-8 rounded-sm">
          <h1 className="text-4xl font-semibold text-center mb-8 font-serif">Instagram</h1>

          {emailVerified && (
            <p className="text-green-600 text-center text-sm mb-3">
              Email verified successfully! You can now log in.
            </p>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="h-10 px-2 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="h-10 px-2 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none"
            />

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading === "loading"}
              className="mt-3 h-9 bg-[#4db5f9] text-white rounded-lg"
            >
              {loading === "loading" ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-xs text-gray-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <p className="text-center text-xs text-gray-500 mt-4 cursor-pointer">
            Forgot password?
          </p>
        </div>

        <div className="bg-white border border-gray-300 mt-3 py-4 text-center rounded-sm">
          <p className="text-sm">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-500 font-semibold cursor-pointer"
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
