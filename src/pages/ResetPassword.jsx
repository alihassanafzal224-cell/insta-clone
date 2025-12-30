import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../store/feauters/authSlice";

export default function ResetPassword() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    setLocalError("");
    dispatch(resetPassword({ token, password }))
      .unwrap()
      .then(() => navigate("/login"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border px-10 py-8 rounded-sm w-87.5">
        <h2 className="text-xl font-semibold text-center mb-4">
          New Password
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10 px-2 border rounded-sm bg-gray-50"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-10 px-2 border rounded-sm bg-gray-50"
          />

          {(error || localError) && (
            <p className="text-red-500 text-xs text-center">
              {localError || error}
            </p>
          )}

          <button
            disabled={loading === "loading"}
            className="h-9 bg-[#4db5f9] text-white rounded-lg"
          >
            {loading === "loading" ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
