import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/feauters/authSlice";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.username|| "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || "/default-avatar.png");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    if (avatar) formData.append("avatar", avatar);

    dispatch(updateProfile(formData));
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gray-300 flex justify-center items-start py-10 relative">
  <div className="max-w-xl w-full bg-white p-6 rounded shadow relative">
    {/* Close Button */}
    <button
      onClick={() => navigate("/profile")}
      className="absolute top-3 right-3 text-gray-500 text-2xl font-bold hover:text-gray-700"
    >
      ×
    </button>

    <h1 className="text-xl font-bold mb-6">Edit Profile</h1>

    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar */}
      <div className="relative w-24 h-24 mx-auto">
        <img
          src={preview}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
        />
        <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 4v9m0-9L5 5h14l-7 7z"
            />
          </svg>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </label>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-semibold">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={150}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
    </form>
  </div>
</div>
  )}