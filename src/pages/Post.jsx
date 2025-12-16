import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../store/feauters/postSlice";


export default function Post() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.post);


    const [caption, setCaption] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        if (!caption || !imageFile) return;


        const formData = new FormData();
        formData.append("caption", caption);
        formData.append("image", imageFile);


        await dispatch(createPost(formData));


        navigate("/");
    };
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
            <div className="w-100 bg-white border border-gray-300 rounded-sm">
                <div className="flex items-center justify-between px-4 h-12 border-b">
                    <button onClick={() => navigate(-1)} className="text-sm font-semibold">
                        Cancel
                    </button>
                    <p className="text-sm font-semibold">Create new post</p>
                    <button
                        onClick={handleSubmit}
                        disabled={loading === "loading"}
                        className="text-sm font-semibold text-blue-500 disabled:opacity-50"  >
                        Share
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4">
                    {!imagePreview ? (
                        <label className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded cursor-pointer">
                            <ImagePlus size={40} className="text-gray-400" />
                            <p className="text-sm text-gray-500 mt-2">Upload a photo</p>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    ) : (
                        <img
                            src={imagePreview}
                            alt="preview"
                            className="w-full h-64 object-cover rounded"
                        />
                    )}
                    <textarea
                        placeholder="Write a caption..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full mt-4 p-2 text-sm border border-gray-300 rounded resize-none focus:outline-none"
                        rows={3}
                    />
                </form>
            </div>
        </div>
    );
}