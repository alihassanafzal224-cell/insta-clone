export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 py-6">
      {/* Profile Header Skeleton */}
      <div className="bg-white border-b border-gray-300 px-6 py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          {/* Avatar Skeleton */}
          <div className="w-28 h-28 rounded-full bg-gray-300 mb-4 md:mb-0 animate-pulse"></div>

          {/* User Info Skeleton */}
          <div className="flex-1 flex flex-col justify-center w-full space-y-4">
            {/* Name & Button Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
              <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-6 w-20 mt-2 md:mt-0 bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Stats Skeleton */}
            <div className="flex space-x-6 text-center md:text-left">
              <div className="space-y-1">
                <div className="h-5 w-10 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-3 w-10 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="space-y-1">
                <div className="h-5 w-10 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-3 w-10 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="space-y-1">
                <div className="h-5 w-10 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-3 w-10 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Bio Skeleton */}
            <div className="space-y-2 mt-2">
              <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-3 w-full bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid Skeleton */}
      <main className="pt-4 max-w-5xl mx-auto w-full flex-1 px-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-full h-48 bg-gray-300 rounded animate-pulse"></div>
          ))}
        </div>
      </main>
    </div>
  );
}
