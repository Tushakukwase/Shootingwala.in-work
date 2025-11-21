import { Suspense } from 'react'
import SearchClient from '@/components/search/SearchClient'
import { SearchSkeleton } from '@/components/search/SearchSkeleton'

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchClient />
    </Suspense>
  )
}