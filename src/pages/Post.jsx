import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Cropper from "react-easy-crop";
import Footer from "../components/Footer";
import { createPost } from "../store/feauters/postSlice";

// Helper functions from your ImageCropper
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
    0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
  );

  return canvas.toDataURL("image/png");
};

export default function Post() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.post);

  const fileInputRef = useRef(null);

  const [caption, setCaption] = useState("");
  const [fileData, setFileData] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(""); // "image" or "video"
  const [imageError, setImageError] = useState("");

  // Image crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  // Video trim states
  const [videoStart, setVideoStart] = useState(0);
  const [videoEnd, setVideoEnd] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const handleFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.type.startsWith("image")) {
      setFileType("image");
      if (!file.type.match("image.*")) {
        setImageError("Please select a valid image file");
        return;
      }
      setImageError("");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFileData(file);
        setFilePreview(reader.result);
        setCroppedImage(null);
      };
    } else if (file.type.startsWith("video")) {
      setFileType("video");
      setFileData(file);
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFileType("");
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createCroppedImage = useCallback(async () => {
    if (!filePreview || !croppedAreaPixels) return;
    const croppedImg = await getCroppedImg(filePreview, croppedAreaPixels, rotation);
    setCroppedImage(croppedImg);
  }, [croppedAreaPixels, rotation, filePreview]);

  const handleVideoMetadata = (e) => {
    const duration = e.target.duration;
    setVideoDuration(duration);
    setVideoEnd(duration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption || (!fileData && !croppedImage)) {
      alert("Caption and file are required");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);

    if (fileType === "image" && croppedImage) {
      const res = await fetch(croppedImage);
      const blob = await res.blob();
      formData.append("media", blob, fileData.name);
    } else if (fileType === "video") {
      formData.append("media", fileData);
      formData.append("trimStart", videoStart);
      formData.append("trimEnd", videoEnd);
    }

    try {
      await dispatch(createPost(formData)).unwrap();
      setCaption("");
      setFileData(null);
      setFilePreview(null);
      setCroppedImage(null);
      setFileType("");
      navigate("/");
    } catch (err) {
      console.error("Post creation failed:", err);
      alert("Failed to create post. Try again.");
    }
  };

  const resetCropper = () => setCroppedImage(null);
  const selectNewFile = () => {
    setFileData(null);
    setFilePreview(null);
    setFileType("");
    setCroppedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="w-100 bg-white border border-gray-300 rounded-sm p-4">
        <div className="flex items-center justify-between h-12 border-b mb-4">
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

        {!filePreview && (
          <label className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded cursor-pointer">
            <ImagePlus size={40} className="text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Upload an image or video</p>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {imageError && <p className="text-red-500 text-sm mt-2">{imageError}</p>}
          </label>
        )}

        {fileType === "image" && filePreview && !croppedImage && (
          <div>
            <div className="relative h-64 md:h-96 bg-gray-200 mb-4">
              <Cropper
                image={filePreview}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mb-2">
              <label>Zoom: {zoom.toFixed(1)}x</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label>Rotation: {rotation}°</label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-between mb-4">
              <button onClick={selectNewFile} className="px-4 py-2 bg-gray-500 text-white rounded">
                Cancel
              </button>
              <button onClick={createCroppedImage} className="px-4 py-2 bg-blue-500 text-white rounded">
                Crop Image
              </button>
            </div>
          </div>
        )}

       
        {fileType === "video" && filePreview && (
          <div>
            <video
              src={filePreview}
              className="w-full h-64 object-cover rounded mb-2"
              controls
              onLoadedMetadata={handleVideoMetadata}
            />
            <div className="mb-2">
              <label>Start: {videoStart.toFixed(1)}s</label>
              <input
                type="range"
                min={0}
                max={videoDuration}
                step={0.1}
                value={videoStart}
                onChange={(e) => setVideoStart(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mb-2">
              <label>End: {videoEnd.toFixed(1)}s</label>
              <input
                type="range"
                min={0}
                max={videoDuration}
                step={0.1}
                value={videoEnd}
                onChange={(e) => setVideoEnd(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Apply Trim Button */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => {
                  if (videoStart >= videoEnd) {
                    alert("Start time must be less than end time");
                    return;
                  }
                  alert(`Trim applied: ${videoStart.toFixed(1)}s to ${videoEnd.toFixed(1)}s`);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Apply Trim
              </button>
            </div>
          </div>
        )}

        {croppedImage && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Cropped Image Preview</h2>
            <img src={croppedImage} alt="Cropped" className="w-full h-auto rounded mb-2" />
            <div className="flex justify-between">
              <button onClick={resetCropper} className="px-4 py-2 bg-gray-500 text-white rounded">
                Crop Again
              </button>
              <button onClick={selectNewFile} className="px-4 py-2 bg-green-500 text-white rounded">
                Select New File
              </button>
            </div>
          </div>
        )}

        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full p-2 border rounded resize-none focus:outline-none"
          rows={3}
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="h-15 mt-4">
        <Footer />
      </div>
    </div>
  );
}
