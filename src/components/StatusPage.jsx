import { useState, useEffect } from "react";

export default function StatusPage({ userStatuses, startIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const currentStatus = userStatuses[currentIndex];

  useEffect(() => {
    if (!currentStatus) return;

    const timer = setTimeout(() => {
      if (currentIndex < userStatuses.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, currentStatus, userStatuses, onClose]);

  if (!currentStatus) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center text-white">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-2xl font-bold"
      >
        ×
      </button>

      <p className="absolute top-6 left-4 font-semibold">{currentStatus.user.name}</p>

      {currentStatus.mediaType === "video" ? (
        <video
          src={currentStatus.media}
          autoPlay
          controls
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <img
          src={currentStatus.media}
          alt={currentStatus.user.name}
          className="max-h-full max-w-full object-contain"
        />
      )}

      {currentIndex > 0 && (
        <button
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="absolute left-2 top-1/2 text-3xl font-bold"
        >
          ‹
        </button>
      )}
      {currentIndex < userStatuses.length - 1 && (
        <button
          onClick={() => setCurrentIndex(currentIndex + 1)}
          className="absolute right-2 top-1/2 text-3xl font-bold"
        >
          ›
        </button>
      )}
    </div>
  );
}
