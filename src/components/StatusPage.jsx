import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

export default function StatusPage({
  userStatuses,
  startIndex = 0,
  onClose,
  showDeleteButton = false,
  onDeleteStatus = null
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const currentStatus = userStatuses[currentIndex];
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  /* -------------------- AUTO-PROGRESS -------------------- */
  useEffect(() => {
    if (!currentStatus) return;

    setProgress(0);
    const duration = 8000; 
    const interval = 50; 
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

  /* -------------------- CLOSE MENU ON OUTSIDE CLICK -------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* -------------------- DELETE -------------------- */
  const handleDelete = () => {
    if (!currentStatus || !onDeleteStatus) return;

    Swal.fire({
      title: "Delete story?",
      text: "This will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ed4956",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteStatus(currentStatus._id);

        if (userStatuses.length === 1) {
          onClose();
        } else if (currentIndex === userStatuses.length - 1) {
          setCurrentIndex(currentIndex - 1);
        }
      }
    });
  };

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
          src={currentStatus.user.avatar || "/default-avatar.png"}
          alt={currentStatus.user.name || currentStatus.user.username}
          className="w-8 h-8 rounded-full border-2 border-white object-cover"
        />
        <span className="text-white font-semibold">
          {currentStatus.user.name || currentStatus.user.username}
        </span>
      </div>

      {/* Instagram-style menu (only for own statuses) */}
      {showDeleteButton && (
        <div ref={menuRef} className="absolute top-15 right-12 z-50">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="text-white text-2xl px-2 hover:bg-white/10 
            rounded-full w-10 h-10 flex items-center justify-center"
          >
            ⋯
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden w-48">
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 border-t border-gray-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

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
          alt={currentStatus.user.name || currentStatus.user.username}
          className="max-h-full max-w-full object-contain"
        />
      )}

      {/* Navigation */}
      {currentIndex > 0 && (
        <button
          onClick={() => {
            setCurrentIndex(currentIndex - 1);
            setProgress(0);
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-3xl font-bold z-50 hover:bg-white/10 rounded-full w-12 h-12 flex items-center justify-center"
        >
          ‹
        </button>
      )}
      {currentIndex < userStatuses.length - 1 && (
        <button
          onClick={() => {
            setCurrentIndex(currentIndex + 1);
            setProgress(0);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-3xl font-bold z-50 hover:bg-white/10 rounded-full w-12 h-12 flex items-center justify-center"
        >
          ›
        </button>
      )}
    </div>
  );
}