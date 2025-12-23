export default function FollowModal({ title, users, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-300 bg-opacity-80 flex items-center justify-center">
      <div className="bg-white w-100 max-w-[90%] rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="w-6" />
          <h2 className="font-semibold text-sm">{title}</h2>
          <button onClick={onClose} className="text-xl font-light">×</button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {users.length === 0 && (
            <p className="text-center text-gray-500 py-6 text-sm">
              No users found
            </p>
          )}

          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <img
                  src={u.avatar || "/default-avatar.png"}
                  alt={u.username}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
                <div>
                  <p className="text-sm font-semibold">{u.username}</p>
                  <p className="text-xs text-gray-500">{u.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
