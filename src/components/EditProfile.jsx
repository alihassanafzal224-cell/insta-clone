import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/feauters/authSlice";
import {  useNavigate } from "react-router-dom";

export default function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.username || "");
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
    <div className="max-w-xl mx-auto bg-white p-6 mt-6 rounded">
      <h1 className="text-xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <img
            src={preview}
            className="w-20 h-20 rounded-full object-cover"
            alt="avatar"
          />
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
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
  );
}