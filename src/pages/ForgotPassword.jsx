import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../store/feauters/authSlice";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const { loading, error, message } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border px-10 py-8 rounded-sm w-87.5">
        <h2 className="text-xl font-semibold text-center mb-4">
          Reset Password
        </h2>

        {message && (
          <p className="text-green-600 text-sm text-center mb-3">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 px-2 border rounded-sm bg-gray-50"
          />

          {error && (
            <p className="text-red-500 text-xs text-center">{error}</p>
          )}

          <button
            disabled={loading === "loading"}
            className="h-9 bg-[#4db5f9] text-white rounded-lg"
          >
            {loading === "loading" ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
