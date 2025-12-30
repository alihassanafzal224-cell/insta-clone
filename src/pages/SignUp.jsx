import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../store/feauters/authSlice";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [verificationSent, setVerificationSent] = useState(false);

  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(form)).then(() => setVerificationSent(true));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-87.5">
        <div className="bg-white border border-gray-300 px-10 py-8 rounded-sm">
          <h1 className="text-4xl font-semibold text-center mb-4 font-serif">Instagram</h1>
          <p className="text-center text-gray-500 text-sm font-semibold mb-6">
            Sign up to see photos and videos from your friends.
          </p>

          {!verificationSent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
                className="h-10 px-2 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="h-10 px-2 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="h-10 px-2 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none"
              />


              {error && <p className="text-red-500 text-xs text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading === "loading"}
                className="mt-3 h-9 bg-[#4db5f9] text-white rounded-lg"
              >
                {loading === "loading" ? "Signing up..." : "Sign up"}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-green-600 font-semibold">
                Registration successful! Please check your email to verify your account.
              </p>
            </div>
          )}
        </div>

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
