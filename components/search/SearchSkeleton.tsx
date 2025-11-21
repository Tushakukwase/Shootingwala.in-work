import { Camera } from 'lucide-react'

export function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter skeleton */}
        <div className="mb-8">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-1/3"></div>
        </div>
        
        {/* Header skeleton */}
        <div className="mb-8 mt-8">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-1/6"></div>
        </div>
        
        {/* Results skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                <div className="flex items-center mb-2">
                  <div className="h-4 bg-gray-200 rounded-lg w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}