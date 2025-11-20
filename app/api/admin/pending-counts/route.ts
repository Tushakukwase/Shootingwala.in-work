import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get pending requests from unified API
    const requestsResponse = await fetch(`${request.nextUrl.origin}/api/requests?status=pending`)
    const requestsData = await requestsResponse.json()
    

    
    // Get photographer galleries and stories separately
    const galleriesResponse = await fetch(`${request.nextUrl.origin}/api/photographer-galleries`)
    const galleriesData = await galleriesResponse.json()
    
    const storiesResponse = await fetch(`${request.nextUrl.origin}/api/photographer-stories`)
    const storiesData = await storiesResponse.json()
    
    // Get pending photographer approvals
    const approvalsResponse = await fetch(`${request.nextUrl.origin}/api/photographer-approvals`)
    const approvalsData = await approvalsResponse.json()
    
    let pendingCategories = 0
    let pendingCities = 0
    let pendingPhotographerGalleries = 0
    let pendingPhotographerStories = 0
    let pendingPhotographerApprovals = 0
    
    if (requestsData.success) {
      const pendingRequests = requestsData.data
      pendingCategories = pendingRequests.filter((req: any) => req.type === 'category').length
      pendingCities = pendingRequests.filter((req: any) => req.type === 'city').length
    }
    

    
    if (galleriesData.success && galleriesData.galleries) {
      // Only count photographer galleries that have requested homepage (pending status)
      pendingPhotographerGalleries = galleriesData.galleries.filter((g: any) => 
        g.status === 'pending' && 
        g.photographerId && 
        g.photographerId !== 'admin' && 
        g.is_notified !== false
      ).length
    }
    
    if (storiesData.success && storiesData.stories) {
      // Only count photographer stories that have requested homepage (pending status)
      pendingPhotographerStories = storiesData.stories.filter((s: any) => 
        s.status === 'pending' && 
        s.photographerId && 
        s.photographerId !== 'admin' && 
        s.is_notified !== false
      ).length
    }
    
    if (approvalsData.success && approvalsData.photographers) {
      // Count pending photographer approvals
      pendingPhotographerApprovals = approvalsData.photographers.filter((p: any) => 
        p.status === 'pending'
      ).length
    }
    
    return NextResponse.json({
      success: true,
      data: {
        categories: pendingCategories,
        cities: pendingCities,
        photographerGalleries: pendingPhotographerGalleries,
        photographerStories: pendingPhotographerStories,
        photographerApprovals: pendingPhotographerApprovals,
        total: pendingCategories + pendingCities + pendingPhotographerGalleries + pendingPhotographerStories + pendingPhotographerApprovals
      }
    })
  } catch (error) {
    console.error('Error fetching pending counts:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pending counts'
    }, { status: 500 })
  }
}