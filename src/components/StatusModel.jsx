import { useState, useEffect } from "react";

export default function StatusModal({ statuses = [], initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentStatus = statuses[currentIndex];

  // Navigate to next status automatically after 5s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < statuses.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose(); // close modal when all statuses viewed
      }
    }, 5000); // 5 seconds per story

    return () => clearTimeout(timer);
  }, [currentIndex, statuses.length, onClose]);

  if (!currentStatus) return null;

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) setCurrentIndex(currentIndex + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold z-50"
      >
        ×
      </button>

      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-50">
        {statuses.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded ${
              idx < currentIndex ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Previous / Next Click Areas */}
      <div
        className="absolute left-0 top-0 h-full w-1/2 cursor-pointer z-40"
        onClick={handlePrev}
      />
      <div
        className="absolute right-0 top-0 h-full w-1/2 cursor-pointer z-40"
        onClick={handleNext}
      />

      {/* Status Content */}
      <div className="relative max-h-[90vh] max-w-[90vw] flex items-center justify-center">
        {currentStatus.mediaType === "video" ? (
          <video
            src={currentStatus.media}
            autoPlay
            muted
            controls={false}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
        ) : (
          <img
            src={currentStatus.media}
            alt="status"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
        )}
        {/* Caption */}
        {currentStatus.caption && (
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
            {currentStatus.caption}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 z-50">
        <img
          src={currentStatus.user.avatar || "/default-avatar.png"}
          alt={currentStatus.user.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <p className="text-white font-semibold">{currentStatus.user.name}</p>
      </div>
    </div>
  );
}
