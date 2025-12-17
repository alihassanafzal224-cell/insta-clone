import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../store/feauters/postSlice";

export default function Post() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.post);

  const [caption, setCaption] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [fileType, setFileType] = useState(""); // "image" or "video"

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileData(file);
    setFilePreview(URL.createObjectURL(file));

    if (file.type.startsWith("image")) setFileType("image");
    else if (file.type.startsWith("video")) setFileType("video");
    else setFileType("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!caption || !fileData) {
      alert("Caption and file are required");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("media", fileData); 

    try {
      await dispatch(createPost(formData)).unwrap(); 
      setCaption("");
      setFileData(null);
      setFilePreview(null);
      setFileType("");
      navigate("/");
    } catch (err) {
      console.error("Post creation failed:", err);
      alert("Failed to create post. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="w-100 bg-white border border-gray-300 rounded-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 border-b">
          <button onClick={() => navigate(-1)} className="text-sm font-semibold">
            Cancel
          </button>
          <p className="text-sm font-semibold">Create New Post</p>
          <button
            onClick={handleSubmit}
            disabled={loading === "loading"}
            className="text-sm font-semibold text-blue-500 disabled:opacity-50"
          >
            {loading === "loading" ? "Posting..." : "Share"}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {!filePreview ? (
            <label className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded cursor-pointer">
              <ImagePlus size={40} className="text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">
                Upload an image or video
              </p>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : fileType === "image" ? (
            <img
              src={filePreview}
              alt="preview"
              className="w-full h-64 object-cover rounded"
            />
          ) : (
            <video
              src={filePreview}
              className="w-full h-64 object-cover rounded"
              controls
              autoPlay
              loop
              muted
            />
          )}

          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full mt-4 p-2 text-sm border border-gray-300 rounded resize-none focus:outline-none"
            rows={3}
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
