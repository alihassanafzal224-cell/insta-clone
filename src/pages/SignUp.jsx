import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../store/feauters/authSlice";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (loading === "success") {
      navigate("/login");
    }
  }, [loading, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(form));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[350px]">
        {/* Signup Card */}
        <div className="bg-white border border-gray-300 px-10 py-8 rounded-sm">
          <h1 className="text-4xl font-semibold text-center mb-4 font-serif">
            Instagram
          </h1>

          <p className="text-center text-gray-500 text-sm font-semibold mb-6">
            Sign up to see photos and videos from your friends.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="h-10 px-2 text-sm border border-gray-300 rounded-sm bg-gray-50 focus:outline-none"
              required
            />

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
              {loading === "loading" ? "Signing up..." : "Sign up"}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
          </p>
        </div>

        {/* Login Redirect Card */}
        <div className="bg-white border border-gray-300 mt-3 py-4 text-center rounded-sm">
          <p className="text-sm">
            Have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-500 font-semibold cursor-pointer"
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}