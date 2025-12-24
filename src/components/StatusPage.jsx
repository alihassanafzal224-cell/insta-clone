import { useState, useEffect } from "react";

export default function StatusPage({ userStatuses, startIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const currentStatus = userStatuses[currentIndex];
  const [progress, setProgress] = useState(0);

  /* -------------------- AUTO-PROGRESS -------------------- */
  useEffect(() => {
    if (!currentStatus) return;

    setProgress(0);
    const duration = 5000; // 5 seconds per status
    const interval = 50; // update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          clearInterval(timer);
          if (currentIndex < userStatuses.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            onClose();
          }
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, currentStatus, userStatuses, onClose]);

  if (!currentStatus) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold z-50"
      >
        ×
      </button>

      {/* Progress bars */}
      <div className="absolute top-4 left-0 right-0 flex px-2 space-x-1 z-40">
        {userStatuses.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded">
            <div
              className={`h-1 bg-white rounded transition-all duration-50`}
              style={{
                width:
                  idx < currentIndex
                    ? "100%"
                    : idx === currentIndex
                    ? `${progress}%`
                    : "0%",
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* User info */}
      <div className="absolute top-8 left-4 flex items-center space-x-2 z-50">
        <img
          src={currentStatus.user.avatar}
          alt={currentStatus.user.name}
          className="w-8 h-8 rounded-full border-2 border-white object-cover"
        />
        <span className="text-white font-semibold">{currentStatus.user.name}</span>
      </div>

      {/* Media */}
      {currentStatus.mediaType === "video" ? (
        <video
          src={currentStatus.media}
          autoPlay
          muted
          playsInline
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <img
          src={currentStatus.media}
          alt={currentStatus.user.name}
          className="max-h-full max-w-full object-contain"
        />
      )}

      {/* Navigation */}
      {currentIndex > 0 && (
        <button
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-3xl font-bold z-50"
        >
          ‹
        </button>
      )}
      {currentIndex < userStatuses.length - 1 && (
        <button
          onClick={() => setCurrentIndex(currentIndex + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-3xl font-bold z-50"
        >
          ›
        </button>
      )}
    </div>
  );
}
