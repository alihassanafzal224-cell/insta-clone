export default function MyStatusBubble({
  user,
  myStatuses,
  onAdd,
  onView,
  showDelete = false,
  onDelete = null,
}) {
  const hasStatuses = myStatuses && myStatuses.length > 0;

  return (
    <div className="flex flex-col items-center relative">
      {/* Avatar container */}
      <div
        onClick={hasStatuses ? onView : undefined}
        className={`w-20 h-20 rounded-full overflow-hidden ${
          hasStatuses ? "border-2 border-pink-500" : "border-2 border-gray-300"
        } ${hasStatuses ? "cursor-pointer" : ""}`}
      >
        <img
          src={user?.avatar || "/default-avatar.png"}
          alt={user?.name || user?.username || "User"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Add (+) button - always visible like Instagram */}
      <label className="absolute bottom-1 right-0 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-sm font-bold border-2 border-white hover:bg-blue-600 transition-colors">
        +
        <input
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={(e) => {
            if (e.target.files[0]) {
              onAdd(e.target.files[0]);
              e.target.value = ""; // Reset input
            }
          }}
        />
      </label>

      {/* Delete button (optional) */}
      {showDelete && hasStatuses && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (myStatuses[0]?._id) {
              onDelete(myStatuses[0]._id);
            }
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
        >
          ×
        </button>
      )}

      <p className="text-xs mt-1 truncate w-16 text-center">
        Your story
      </p>
    </div>
  );
}