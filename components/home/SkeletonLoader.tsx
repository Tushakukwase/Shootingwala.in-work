"use client"

import { cn } from "@/lib/utils"

interface SkeletonLoaderProps {
  className?: string
}

export function HomeContentSkeleton() {
  return (
    <div className="space-y-16">
      {/* Recommended For You Skeleton */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Section Header Skeleton */}
            <div className="text-center space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse mx-auto w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded-lg animate-pulse mx-auto w-1/2"></div>
            </div>
            
            {/* Photographer Cards Skeleton */}
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="h-48 bg-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-3/4"></div>
                      <div className="flex flex-wrap gap-2">
                        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-14"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-1/3"></div>
                        <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Searches Categories Skeleton */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-1/3 mx-auto mb-12"></div>
          <div className="flex gap-5 overflow-hidden">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-44">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="h-32 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg animate-pulse mt-2 w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Skeleton */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-1/4 mx-auto mb-12"></div>
          <div className="flex gap-5 overflow-hidden">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-44">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="h-32 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg animate-pulse mt-2 w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Wedding Stories Skeleton */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-1/3 mx-auto mb-12"></div>
          <div className="flex gap-5 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-64">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery to Look for Skeleton */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
          </div>
          <div className="flex gap-5 overflow-hidden">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-52">
                <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
                  <div className="h-36 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export function HeroSectionSkeleton() {
  return (
    <section className="relative h-[600px] flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 space-y-6">
        <div className="h-12 bg-gray-300 rounded-lg animate-pulse mx-auto w-3/4"></div>
        <div className="h-8 bg-gray-300 rounded-lg animate-pulse mx-auto w-1/2"></div>
        <div className="h-6 bg-gray-300 rounded-lg animate-pulse mx-auto w-2/3"></div>
        <div className="flex justify-center gap-4 mt-8">
          <div className="h-12 bg-gray-300 rounded-lg animate-pulse w-32"></div>
          <div className="h-12 bg-gray-300 rounded-lg animate-pulse w-32"></div>
        </div>
        <div className="absolute bottom-8 left-0 right-0 z-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="p-6 md:p-8 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="h-8 bg-gray-300 rounded-lg animate-pulse mx-auto w-1/3 mb-6"></div>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="flex-1 h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="w-full md:w-auto h-12 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}