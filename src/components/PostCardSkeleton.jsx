export default function PostCardSkeleton() {
  return (
    <div className="bg-white border border-gray-300 mb-6 rounded-sm animate-pulse ">
      <div className="flex items-center px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
        <div className="h-3 w-24 bg-gray-300 rounded" />
      </div>

      <div className="w-full h-96 bg-gray-300" />

      <div className="flex justify-between px-4 py-3">
        <div className="flex gap-4">
          <div className="w-6 h-6 bg-gray-300 rounded" />
          <div className="w-6 h-6 bg-gray-300 rounded" />
          <div className="w-6 h-6 bg-gray-300 rounded" />
        </div>
        <div className="w-6 h-6 bg-gray-300 rounded" />
      </div>

      <div className="px-4 pb-4 space-y-2">
        <div className="h-3 w-32 bg-gray-300 rounded" />
        <div className="h-3 w-48 bg-gray-300 rounded" />
      </div>
    </div>
  );
}
