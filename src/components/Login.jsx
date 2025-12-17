import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/feauters/authSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const { loading, error } = useSelector((state) => state.auth);

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
        {/* Login Card */}
        <div className="bg-white border border-gray-300 px-10 py-8 rounded-sm">
          <h1 className="text-4xl font-semibold text-center mb-8 font-serif">
            Instagram
          </h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="h-10 px-2 text-sm border border-gray-300 rounded-sm bg-gray-50 focus:outline-none"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="h-10 px-2 text-sm border border-gray-300 rounded-sm bg-gray-50 focus:outline-none"
              required
            />

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading === "loading"}
              className="mt-3 h-9 bg-[#4db5f9] text-white text-sm font-semibold rounded-lg disabled:opacity-50"
            >
              {loading === "loading" ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-xs text-gray-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <p className="text-center text-xs text-gray-500 mt-4 cursor-pointer">
            Forgot password?
          </p>
        </div>

        {/* Signup Card */}
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
